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

interface WebInfo { description: string; image: string | null; price: string | null; }

function extractPrice(text: string): string | null {
  const m = text.match(/\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
  return m ? `$${m[1]}` : null;
}

// Google Custom Search (needs GOOGLE_API_KEY + GOOGLE_CSE_ID), falling back to
// DuckDuckGo's free instant-answer API so web lookup always works without keys.
async function webLookup(q: string): Promise<WebInfo | null> {
  const key = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;
  const searchQ = `${q} car part`;
  if (key && cx) {
    try {
      const base = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=${encodeURIComponent(searchQ)}`;
      const [webRes, imgRes] = await Promise.all([
        fetch(`${base}&num=3`, { signal: AbortSignal.timeout(7000) }),
        fetch(`${base}&searchType=image&num=1`, { signal: AbortSignal.timeout(7000) }),
      ]);
      const web = webRes.ok ? await webRes.json() : null;
      const img = imgRes.ok ? await imgRes.json() : null;
      const items: any[] = web?.items || [];
      const snippet = items.map((i) => `${i.title || ""} ${i.snippet || ""}`).join(" ");
      if (items.length) {
        return {
          description: items[0].snippet || `${titleCase(q)} — sourced from our supplier network.`,
          image: img?.items?.[0]?.link || null,
          price: extractPrice(snippet),
        };
      }
    } catch { /* fall through to DuckDuckGo */ }
  }
  try {
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQ)}&format=json&no_html=1&skip_disambig=1`,
      { signal: AbortSignal.timeout(7000) }
    );
    if (!res.ok) return null;
    const d = await res.json();
    const abstract = d.AbstractText || d.RelatedTopics?.[0]?.Text || "";
    return {
      description: abstract || `${titleCase(q)} — sourced from our supplier network.`,
      image: d.Image ? (d.Image.startsWith("http") ? d.Image : `https://duckduckgo.com${d.Image}`) : null,
      price: extractPrice(abstract),
    };
  } catch {
    return null;
  }
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
  // Catalog miss — while the user is still typing we stop here; on submit we go to the web
  if (suggestOnly) return NextResponse.json({ products: [], sourced: false });

  const info = await webLookup(q);
  const category = guessCategory(q);
  const product = {
    name: titleCase(q),
    brand: "Motoverse Sourced",
    make: guessMake(q),
    category,
    price: info?.price || "Price on request",
    badge: "Sourced",
    stock: 10,
    featured: false,
    description: (info?.description || `${titleCase(q)} — sourced on request.`).slice(0, 500) +
      " We locate this part through our supplier network and confirm availability, exact pricing, and fitment with you before shipping.",
    image: info?.image || CATEGORY_IMG[category] || "/parts/car5.jpeg",
  };

  // Persist it so the part is on the website for every future customer
  if (sb) {
    const { data, error } = await sb.from("products").insert(product).select().single();
    if (!error && data) return NextResponse.json({ products: [data], sourced: true });
  }
  // Supabase unavailable — still hand the customer a usable cart item
  return NextResponse.json({ products: [{ ...product, id: -Date.now() }], sourced: true });
}
