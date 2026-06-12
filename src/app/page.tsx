"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { type Product, CAR_MAKES } from "@/lib/products";
import { ProductCard, OrderModal } from "@/components/Product";
import { SearchBar } from "@/components/SearchBar";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { threshold: .1 });
    ref.current?.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

// Real spare-part product photos
const IMG = {
  controlArm: "/parts/car1.jpeg",
  strut:      "/parts/car2.jpeg",
  container:  "/parts/car3.jpeg",
  warehouse:  "/parts/car4.jpeg",
  engineKit:  "/parts/car5.jpeg",
  engineParts:"/parts/car6.jpeg",
  // aliases used across sections
  brakePad:   "/parts/car1.jpeg",
  rotor:      "/parts/car2.jpeg",
  engine:     "/parts/car5.jpeg",
  sparkPlug:  "/parts/car6.jpeg",
  alternator: "/parts/car4.jpeg",
  headlight:  "/parts/car3.jpeg",
  suspension: "/parts/car2.jpeg",
  tools:      "/parts/car6.jpeg",
  shop:       "/parts/car4.jpeg",
}

// Hero background slideshow images
const HERO_SLIDES = [
  "/parts/hero-bg.jpeg",
  "/parts/car4.jpeg",
  "/parts/car7.jpeg",
  "/parts/car3.jpeg",
  "/parts/car5.jpeg",
];

const CATEGORY_CARDS = [
  { t: "Engine & Drivetrain", c: "Engine", img: IMG.engineKit },
  { t: "Suspension & Steering", c: "Suspension", img: IMG.strut },
  { t: "Body Panels & Lots", c: "Body", img: IMG.container },
  { t: "Warehouse Surplus", c: "Engine", img: IMG.warehouse },
];
const FEATURES = [
  { t: "Free Shipping", d: "On orders over $250", icon: "M2 8h12l4 5v4H2z" },
  { t: "Support 24/7", d: "Call or chat anytime", icon: "M4 4h16v12H5.2L4 18z" },
  { t: "100% Genuine", d: "Verified & warrantied", icon: "M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" },
  { t: "Hot Offers", d: "Discounts up to 30%", icon: "M20 12l-8 8-9-9V3h8z" },
];
const SERVICES = [
  { t: "OEM & Aftermarket Parts", d: "Genuine and performance parts for every make and model, verified before shipping.", img: IMG.engineParts },
  { t: "Nationwide Delivery", d: "Fast, tracked, insured shipping to all 50 states from our regional hubs.", img: IMG.container },
  { t: "Rare Part Sourcing", d: "Send your vehicle details and we hunt down discontinued and hard-to-find parts.", img: IMG.warehouse },
];
const CATEGORIES_SHOWCASE = [
  { t: "Control Arms", img: IMG.controlArm, c: "Suspension" },
  { t: "Strut Assemblies", img: IMG.strut, c: "Suspension" },
  { t: "Complete Engines", img: IMG.engineKit, c: "Engine" },
  { t: "Engine Internals", img: IMG.engineParts, c: "Engine" },
  { t: "Body Panel Lots", img: IMG.container, c: "Body" },
  { t: "Warehouse Stock", img: IMG.warehouse, c: "Engine" },
];
const STEPS = [
  { n: "01", t: "Find Your Part", d: "Pick your car brand or search the catalog." },
  { n: "02", t: "Add to Cart", d: "View details, price, and stock — then add it." },
  { n: "03", t: "Submit Order", d: "Name, phone, address — no account needed." },
  { n: "04", t: "We Deliver", d: "We confirm and ship to your door, tracked." },
];
const STATS = [
  { n: "1K+", l: "Parts in stock" },
  { n: "50", l: "States shipped" },
  { n: "98%", l: "On-time dispatch" },
  { n: "4.9★", l: "Customer rating" },
];
const GALLERY_PLACEHOLDER = [IMG.warehouse, IMG.container, IMG.engineKit, IMG.controlArm, IMG.strut, IMG.engineParts];
const REVIEWS_PLACEHOLDER = [
  { id: -1, name: "Marcus T.", location: "Columbus, OH", rating: 5, text: "Found a discontinued alternator no one else had. Shipped in two days. These guys are the real deal." },
  { id: -2, name: "Diana R.", location: "Miami, FL", rating: 5, text: "Ordered brake pads at midnight, got a call back next morning to confirm. Smooth, professional, fast." },
  { id: -3, name: "Eddie's Garage", location: "Austin, TX", rating: 5, text: "We source bulk parts through Motoverse weekly now. Couldn't run the shop without them." },
];
const FAQS = [
  { q: "Do I need an account to order?", a: "No. Just browse, add to cart or quick-order, fill in your details, and submit. We take it from there." },
  { q: "Do you ship to all 50 states?", a: "Yes — fast, tracked, insured shipping nationwide from our Ohio, Florida, and Texas hubs." },
  { q: "How does payment work?", a: "No online checkout. You place an order with your details, we confirm availability, then arrange payment and delivery." },
  { q: "Can you find a part that isn't listed?", a: "Absolutely. Use the contact form or live chat with your year, make, and model — we reply within 24 hours." },
];

interface Review { id: number; name: string; location: string; rating: number; text: string; }
interface Gal { id: number; url: string; }

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 p-6 text-left">
        <span className="font-bold text-ink">{q}</span>
        <span className={`grid h-7 w-7 flex-none place-items-center rounded-lg bg-blue/10 text-blue transition-transform duration-300 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className="grid transition-all duration-300" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden"><p className="px-6 pb-6 leading-relaxed text-slatey">{a}</p></div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [modal, setModal] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<Gal[]>([]);
  const [make, setMake] = useState("");
  const [cat, setCat] = useState("");
  const [slide, setSlide] = useState(0);
  const ref = useReveal();

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setProducts(d.products || [])).catch(() => {});
    fetch("/api/reviews").then(r => r.json()).then(d => setReviews(d.reviews || [])).catch(() => {});
    fetch("/api/gallery").then(r => r.json()).then(d => setGallery(d.gallery || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const search = () => {
    const q = new URLSearchParams();
    if (make) q.set("make", make);
    if (cat) q.set("cat", cat);
    router.push(`/products?${q.toString()}`);
  };
  const featured = products.filter(p => p.featured).slice(0, 8);
  const showcase = (featured.length ? featured : products).slice(0, 8);
  const galleryShown = gallery.length > 0 ? gallery.map(g => g.url) : GALLERY_PLACEHOLDER;
  const reviewsShown = reviews.length > 0 ? reviews : REVIEWS_PLACEHOLDER;

  return (
    <div ref={ref} className="bg-white text-ink">
      {/* HERO */}
      <section className="relative overflow-hidden pt-[72px]">
        <div className="absolute inset-0">
          {HERO_SLIDES.map((src, i) => (
            <div
              key={src}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
              style={{ backgroundImage: `url(${src})`, opacity: i === slide ? 1 : 0 }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/70 to-ink/85" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center text-white">
          <motion.span initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bluebright" /> Parts for every make · Shipped to all 50 states
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1, duration: .7 }}
            className="mt-6 font-display font-extrabold leading-[1.05] tracking-tight" style={{ fontSize: "clamp(40px,6vw,72px)" }}>
            Find Parts For Your Vehicle
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25, duration: .7 }}
            className="mx-auto mt-5 max-w-xl text-lg text-white/80">
            Hundreds of brands and thousands of parts for all cars — no account needed. Browse, order, delivered.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .4, duration: .7 }}
            className="mx-auto mt-9 max-w-2xl">
            <SearchBar variant="hero" placeholder="Search any part — if we don't stock it, we'll find it for you…" />
            <div className="mt-3 flex flex-col gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur sm:flex-row">
              <select value={make} onChange={(e) => setMake(e.target.value)} className="input flex-1">
                <option value="">All Brands</option>
                {CAR_MAKES.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
              <select value={cat} onChange={(e) => setCat(e.target.value)} className="input flex-1">
                <option value="">All Types</option>
                {["Engine","Brakes","Suspension","Electrical","Interior","Body","Tools"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={search} className="btn btn-blue sm:px-10">Browse</button>
            </div>
          </motion.div>
          <div className="mt-8 flex justify-center gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === slide ? "w-8 bg-bluebright" : "w-2 bg-white/40 hover:bg-white/70"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY CARDS */}
      <section className="relative z-20 -mt-12">
        <div className="wrap grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_CARDS.map((c, i) => (
            <Link key={i} href={`/products?cat=${c.c}`} className="group relative h-44 overflow-hidden rounded-2xl shadow-card">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${c.img})` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-ink/20" />
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <h3 className="font-display text-lg font-extrabold text-white">{c.t}</h3>
                <span className="mt-1 text-sm font-semibold text-bluebright">Shop now →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="py-14">
        <div className="wrap grid gap-6 rounded-2xl border border-line bg-cloud p-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-blue/10 text-blue">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d={f.icon} /></svg>
              </span>
              <div><div className="font-bold text-ink">{f.t}</div><div className="text-sm text-mist">{f.d}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* SHOP BY BRAND */}
      <section id="brands" className="py-14">
        <div className="wrap">
          <div className="reveal text-center">
            <span className="eyebrow">Shop by brand</span>
            <h2 className="h-sec mt-3 text-4xl md:text-5xl">Find parts for your car</h2>
            <p className="mx-auto mt-3 max-w-xl text-slatey">Click your car&apos;s brand to browse every part we stock for it. We carry parts for all makes.</p>
          </div>
          <div className="reveal mt-10 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
            {CAR_MAKES.map((m) => (
              <Link key={m.name} href={`/products?make=${encodeURIComponent(m.name)}`}
                className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-blue hover:shadow-card">
                <div className="grid h-14 w-14 place-items-center"><img src={m.logo} alt={m.name} className="max-h-full max-w-full object-contain" loading="lazy" /></div>
                <span className="text-xs font-bold text-slatey group-hover:text-blue">{m.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT US */}
      <section id="about" className="bg-cloud py-16">
        <div className="wrap grid items-center gap-12 md:grid-cols-2">
          <div className="reveal overflow-hidden rounded-3xl border border-line shadow-card">
            <img src={IMG.shop} alt="Motoverse warehouse" className="h-full w-full object-cover" />
          </div>
          <div className="reveal">
            <span className="eyebrow">About us</span>
            <h2 className="h-sec mt-3 text-4xl md:text-5xl">A general spare-parts store for every car.</h2>
            <p className="mt-5 leading-relaxed text-slatey">Motoverse stocks thousands of OEM and aftermarket parts for all makes and models — engine, brakes, suspension, electrical, body, and interior. We source, verify, and ship directly to drivers and shops across all 50 states from our hubs in Ohio, Florida, and Austin, Texas. No account, no hassle — just find your part and order.</p>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div className="card p-5"><div className="font-bold text-blue">Our Mission</div><p className="mt-2 text-sm leading-relaxed text-slatey">Make finding the right part effortless — fair prices, real inventory, fast delivery.</p></div>
              <div className="card p-5"><div className="font-bold text-blue">Our Promise</div><p className="mt-2 text-sm leading-relaxed text-slatey">Every part verified and warrantied before it ships.</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-16">
        <div className="wrap">
          <div className="reveal text-center"><span className="eyebrow">Our services</span><h2 className="h-sec mt-3 text-4xl md:text-5xl">More than a parts store</h2></div>
          <div className="reveal mt-10 grid gap-5 md:grid-cols-3">
            {SERVICES.map((s, i) => (
              <Link key={i} href="/services" className="card group overflow-hidden">
                <div className="aspect-[16/10] overflow-hidden bg-cloud"><img src={s.img} alt={s.t} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-extrabold text-ink">{s.t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slatey">{s.d}</p>
                  <span className="mt-4 inline-block text-sm font-bold text-blue group-hover:translate-x-1 transition-transform">Learn more →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US (stats) */}
      <section className="py-12">
        <div className="wrap">
          <div className="reveal rounded-3xl bg-blue px-8 py-12 text-white">
            <div className="grid gap-8 text-center sm:grid-cols-2 md:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.l}><div className="font-display text-4xl font-extrabold md:text-5xl">{s.n}</div><div className="mt-2 text-sm text-white/80">{s.l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section id="products" className="py-14">
        <div className="wrap">
          <div className="reveal flex flex-wrap items-end justify-between gap-4">
            <div><span className="eyebrow">Featured products</span><h2 className="h-sec mt-3 text-4xl md:text-5xl">Popular right now</h2></div>
            <Link href="/products" className="btn btn-ghost">View all</Link>
          </div>
          <div className="reveal mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {showcase.map((p) => <ProductCard key={p.id} p={p} onOpen={setModal} />)}
            {products.length === 0 && <p className="col-span-full text-center text-mist">Products will appear here once added in the admin dashboard.</p>}
          </div>
        </div>
      </section>

      {/* BEST-SELLING CATEGORIES */}
      <section className="bg-cloud py-16">
        <div className="wrap">
          <div className="reveal text-center"><span className="eyebrow">Browse categories</span><h2 className="h-sec mt-3 text-4xl md:text-5xl">Best-selling categories</h2></div>
          <div className="reveal mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES_SHOWCASE.map((c, i) => (
              <Link key={i} href={`/products?cat=${c.c}`} className="card group overflow-hidden text-center">
                <div className="aspect-square overflow-hidden bg-white"><img src={c.img} alt={c.t} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" /></div>
                <div className="p-3"><span className="text-sm font-bold text-ink group-hover:text-blue">{c.t}</span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16">
        <div className="wrap">
          <div className="reveal text-center"><span className="eyebrow">How it works</span><h2 className="h-sec mt-3 text-4xl md:text-5xl">Order in 4 simple steps</h2></div>
          <div className="reveal mt-10 grid gap-5 md:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="card p-7">
                <div className="font-display text-4xl font-extrabold text-blue/20">{s.n}</div>
                <h3 className="mt-3 text-lg font-bold text-ink">{s.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slatey">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="bg-cloud py-16">
        <div className="wrap">
          <div className="reveal text-center"><span className="eyebrow">Gallery</span><h2 className="h-sec mt-3 text-4xl md:text-5xl">Inside the warehouse</h2><p className="mx-auto mt-3 max-w-xl text-slatey">Real shelves, real inventory — what you order is what we hold.</p></div>
          <div className="reveal mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
            {galleryShown.slice(0, 6).map((url, i) => (
              <div key={i} className={`overflow-hidden rounded-2xl border border-line ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                <img src={url} alt="" loading="lazy" className={`w-full object-cover transition-transform duration-500 hover:scale-105 ${i === 0 ? "h-full min-h-[260px]" : "h-44"}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="py-16">
        <div className="wrap">
          <div className="reveal text-center"><span className="eyebrow">Reviews</span><h2 className="h-sec mt-3 text-4xl md:text-5xl">Trusted by drivers &amp; shops</h2></div>
          <div className="reveal mt-10 grid gap-5 md:grid-cols-3">
            {reviewsShown.slice(0, 3).map((r) => (
              <div key={r.id} className="card p-7">
                <div className="flex gap-0.5 text-blue">{Array.from({ length: r.rating }).map((_, j) => <span key={j}>★</span>)}</div>
                <p className="mt-4 leading-relaxed text-slatey">“{r.text}”</p>
                <div className="mt-5 border-t border-line pt-4"><div className="font-bold text-ink">{r.name}</div><div className="text-sm text-mist">{r.location}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-cloud py-16">
        <div className="wrap max-w-3xl">
          <div className="reveal text-center"><span className="eyebrow">FAQ</span><h2 className="h-sec mt-3 text-4xl md:text-5xl">Frequently asked questions</h2></div>
          <div className="reveal mt-10 space-y-3">{FAQS.map((f, i) => <Faq key={i} q={f.q} a={f.a} />)}</div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-16">
        <div className="wrap grid items-center gap-10 md:grid-cols-2">
          <div className="reveal">
            <span className="eyebrow">Contact us</span>
            <h2 className="h-sec mt-3 text-4xl md:text-5xl">Can&apos;t find the part?</h2>
            <p className="mt-5 leading-relaxed text-slatey">Send us the year, make, model, and part you need. Our team replies within 24 hours with availability and pricing.</p>
            <div className="mt-7 space-y-3">
              <a href="mailto:motoversespareparts@gmail.com" className="flex items-center gap-3 text-slatey hover:text-blue">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue/10 text-blue"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="16" height="12" rx="2" /><path d="m1 5 8 5 8-5" /></svg></span>
                motoversespareparts@gmail.com
              </a>
              <div className="flex items-center gap-3 text-slatey">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue/10 text-blue"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7Z" /><circle cx="12" cy="9" r="2.5" /></svg></span>
                Ohio · Florida · Austin, Texas
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-blue">Request a Part</Link>
              <Link href="/products" className="btn btn-ghost">Browse Catalog</Link>
            </div>
          </div>
          <div className="reveal overflow-hidden rounded-3xl border border-line shadow-card">
            <img src={IMG.alternator} alt="Car parts" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16">
        <div className="wrap">
          <div className="reveal overflow-hidden rounded-3xl bg-blue px-8 py-16 text-center text-white">
            <h2 className="mx-auto max-w-2xl font-display text-4xl font-extrabold tracking-tight md:text-5xl">Ready to find your part?</h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-white/85">Browse the catalog or send us a request — no account needed.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/products" className="btn btn-white">Shop Parts</Link>
              <a href="mailto:motoversespareparts@gmail.com" className="btn border border-white/40 text-white hover:bg-white/10">Email Us</a>
            </div>
          </div>
        </div>
      </section>

      <OrderModal p={modal} onClose={() => setModal(null)} />
    </div>
  );
}
