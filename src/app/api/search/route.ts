import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { CAR_MAKES } from "@/lib/products";

export const dynamic = "force-dynamic";

// Keyword → category guessing for parts sourced from the web
const CATEGORY_KEYWORDS: [string, string[]][] = [
  ["Brakes", ["brake", "pad", "rotor", "caliper", "disc", "abs"]],
  ["Suspension", ["shock", "strut", "spring", "control arm", "suspension", "sway bar", "ball joint", "tie rod", "bushing", "stabilizer"]],
  ["Electrical", ["battery", "alternator", "starter", "spark plug", "ignition", "sensor", "light", "bulb", "headlight", "taillight", "wiring", "fuse", "ecu", "relay"]],
  ["Interior", ["seat", "dashboard", "dash", "floor mat", "carpet", "console", "steering wheel", "interior", "armrest", "visor"]],
  ["Body", ["bumper", "fender", "door", "mirror", "hood", "panel", "grille", "windshield", "trunk", "wing", "spoiler", "wiper"]],
  ["Tools", ["wrench", "jack", "tool", "scanner", "socket", "torque", "gauge"]],
];
const CATEGORY_IMG: Record<string, string> = {
  Engine: "/parts/car5.jpeg", Brakes: "/parts/car1.jpeg", Suspension: "/parts/car2.jpeg",
  Electrical: "/parts/car4.jpeg", Interior: "/parts/car3.jpeg", Body: "/parts/car3.jpeg", Tools: "/parts/car6.jpeg",
};

function guessCategory(q: string) {
  const lq = q.toLowerCase();
  for (const [cat, words] of CATEGORY_KEYWORDS) if (words.some((w) => lq.includes(w))) return cat;
  return "Engine";
}
function guessMake(q: string) {
  const lq = q.toLowerCase();
  const hit = CAR_MAKES.find((m) => lq.includes(m.name.toLowerCase()));
  return hit ? hit.name : "Universal";
}
function titleCase(q: string) {
  return q.trim().replace(/\s+/g, " ").split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

async function searchCatalog(sb: NonNullable<ReturnType<typeof getSupabase>>, q: string) {
  const term = q.replace(/[,()%]/g, " ").trim();
  if (!term) return [];
  const fields = ["name", "brand", "make", "category", "description"];
  const phrase = fields.map((f) => `${f}.ilike.%${term}%`).join(",");
  const { data } = await sb.from("products").select("*").or(phrase).limit(8);
  if (data && data.length) return data;
  // No phrase match — try matching every significant word (e.g. "honda front brake pads")
  const words = term.split(/\s+/).filter((w) => w.length >= 3);
  if (!words.length) return [];
  let query = sb.from("products").select("*");
  for (const w of words) query = query.or(fields.map((f) => `${f}.ilike.%${w}%`).join(","));
  const { data: wordHits } = await query.limit(8);
  return wordHits || [];
}

interface WebInfo { description: string | null; image: string | null; price: string | null; }

function extractPrice(text: string): string | null {
  const m = text.match(/\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
  return m ? `$${m[1]}` : null;
}

async function jsonFetch(url: string): Promise<any | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000), headers: { "User-Agent": "Mozilla/5.0" } });
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

// Web lookup chain: Google Custom Search (if GOOGLE_API_KEY + GOOGLE_CSE_ID are
// set) → DuckDuckGo instant answers → Openverse image search. The free fallbacks
// need no keys, so the lookup always has a chance to find a real photo.
async function webLookup(q: string): Promise<WebInfo> {
  const info: WebInfo = { description: null, image: null, price: null };
  const searchQ = `${q} car part`;
  const key = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;

  if (key && cx) {
    const base = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=${encodeURIComponent(searchQ)}`;
    const [web, img] = await Promise.all([jsonFetch(`${base}&num=3`), jsonFetch(`${base}&searchType=image&num=1`)]);
    const items: any[] = web?.items || [];
    if (items.length) {
      info.description = items[0].snippet || null;
      info.price = extractPrice(items.map((i) => `${i.title || ""} ${i.snippet || ""}`).join(" "));
    }
    info.image = img?.items?.[0]?.link || null;
    if (info.image && info.description) return info;
  }

  const ddg = await jsonFetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(searchQ)}&format=json&no_html=1&skip_disambig=1`);
  if (ddg) {
    const abstract = ddg.AbstractText || ddg.RelatedTopics?.[0]?.Text || "";
    if (!info.description && abstract) { info.description = abstract; info.price = info.price || extractPrice(abstract); }
    if (!info.image && ddg.Image) info.image = ddg.Image.startsWith("http") ? ddg.Image : `https://duckduckgo.com${ddg.Image}`;
  }

  if (!info.image) {
    const ov = await jsonFetch(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(searchQ)}&page_size=1`);
    info.image = ov?.results?.[0]?.thumbnail || ov?.results?.[0]?.url || null;
  }
  return info;
}

function buildProduct(q: string, info: WebInfo) {
  const category = guessCategory(q);
  const make = guessMake(q);
  const name = titleCase(q);
  const description = info.description
    ? info.description.slice(0, 400)
    : `${name} — quality ${make === "Universal" ? "" : `${make} `}replacement part, verified before shipping. We confirm exact pricing and fitment with you when you order.`;
  return {
    name,
    brand: "Motoverse",
    make,
    category,
    price: info.price || "Price on request",
    badge: "New",
    stock: 10,
    featured: false,
    description,
    image: info.image || CATEGORY_IMG[category] || "/parts/car5.jpeg",
  };
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  const suggestOnly = req.nextUrl.searchParams.get("suggest") === "1";
  if (!q) return NextResponse.json({ products: [], sourced: false });

  const sb = getSupabase();
  if (sb) {
    const hits = await searchCatalog(sb, q);
    if (hits.length) return NextResponse.json({ products: hits, sourced: false });
  }
  if (suggestOnly) return NextResponse.json({ products: [], sourced: false });

  // Catalog miss — build the product from a web lookup, but don't persist yet:
  // it's saved to the catalog only when the customer actually adds it to cart.
  const product = buildProduct(q, await webLookup(q));
  return NextResponse.json({ products: [{ ...product, id: -Date.now() }], sourced: true });
}

// Persists a web-sourced product the moment a customer adds it to their cart,
// so it's part of the website's catalog from then on.
export async function POST(req: NextRequest) {
  const sb = getSupabase();
  const b = await req.json().catch(() => null);
  if (!b?.name || !b?.image) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const product = {
    name: String(b.name).slice(0, 160),
    brand: "Motoverse",
    make: guessMake(String(b.name)),
    category: CATEGORY_IMG[b.category] ? String(b.category) : guessCategory(String(b.name)),
    price: String(b.price || "Price on request").slice(0, 40),
    badge: "New",
    stock: 10,
    featured: false,
    description: String(b.description || "").slice(0, 500),
    image: String(b.image).slice(0, 1000),
  };
  if (sb) {
    // If a customer added this same part moments ago, reuse it instead of duplicating
    const { data: existing } = await sb.from("products").select("*").ilike("name", product.name).limit(1);
    if (existing && existing.length) return NextResponse.json({ product: existing[0] });
    const { data, error } = await sb.from("products").insert(product).select().single();
    if (!error && data) return NextResponse.json({ product: data });
  }
  return NextResponse.json({ product: { ...product, id: -Date.now() } });
}
