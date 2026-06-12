"use client";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, CAR_MAKES, type Product } from "@/lib/products";
import { ProductCard, OrderModal } from "@/components/Product";
import { SearchBar } from "@/components/SearchBar";

function ProductsInner() {
  const params = useSearchParams();
  const [all, setAll] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState(params.get("cat") || "All");
  const [make, setMake] = useState(params.get("make") || "All");
  const [q, setQ] = useState(params.get("q") || "");
  const [sort, setSort] = useState("featured");
  const [modal, setModal] = useState<Product | null>(null);

  useEffect(() => { setCat(params.get("cat") || "All"); setMake(params.get("make") || "All"); setQ(params.get("q") || ""); }, [params]);
  useEffect(() => { fetch("/api/products").then(r => r.json()).then(d => { setAll(d.products || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const list = useMemo(() => {
    let r = all.filter((p) =>
      (cat === "All" || p.category === cat) &&
      (make === "All" || p.make === make) &&
      (q === "" || p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase()))
    );
    const num = (p: Product) => parseFloat(p.price.replace(/[$,]/g, "")) || 0;
    if (sort === "low") r = [...r].sort((a, b) => num(a) - num(b));
    if (sort === "high") r = [...r].sort((a, b) => num(b) - num(a));
    if (sort === "featured") r = [...r].sort((a, b) => Number(b.featured) - Number(a.featured));
    return r;
  }, [all, cat, make, q, sort]);

  return (
    <div className="bg-white text-ink">
      <section className="border-b border-line bg-cloud pt-[104px] pb-10">
        <div className="wrap">
          <span className="eyebrow">Catalog</span>
          <h1 className="h-sec mt-2 text-4xl md:text-5xl">{make !== "All" ? `${make} Parts` : cat !== "All" ? `${cat} Parts` : "All Parts"}</h1>
          <p className="mt-3 text-slatey">{loading ? "Loading…" : `${list.length} parts ready to ship nationwide.`}</p>
          <div className="mt-6 max-w-2xl">
            <SearchBar placeholder="Search any part — name, brand, or vehicle…" />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="wrap grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* sidebar filters */}
          <aside className="h-fit space-y-6 lg:sticky lg:top-24">
            <div>
              <label className="mb-2 block text-sm font-bold text-ink">Search</label>
              <input className="input" placeholder="Part or brand…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-ink">Car make</label>
              <select className="input" value={make} onChange={(e) => setMake(e.target.value)}>
                <option value="All">All makes</option>
                {CAR_MAKES.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-ink">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c} onClick={() => setCat(c)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${cat === c ? "bg-blue text-white" : "border border-line text-slatey hover:border-blue hover:text-blue"}`}>{c}</button>
                ))}
              </div>
            </div>
            {(make !== "All" || cat !== "All" || q) && <button onClick={() => { setMake("All"); setCat("All"); setQ(""); }} className="btn btn-ghost w-full">Clear filters</button>}
          </aside>

          {/* grid */}
          <div>
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm text-mist">{list.length} results</span>
              <select className="input w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
              </select>
            </div>
            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card overflow-hidden"><div className="aspect-[4/3] animate-pulse bg-cloud" /><div className="space-y-2 p-5"><div className="h-3 w-1/3 animate-pulse rounded bg-cloud" /><div className="h-4 w-2/3 animate-pulse rounded bg-cloud" /></div></div>
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="card p-16 text-center"><p className="text-mist">{all.length === 0 ? "No products yet — run the seed (see SETUP)." : "No parts match these filters."}</p></div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((p) => <ProductCard key={p.id} p={p} onOpen={setModal} />)}</div>
            )}
          </div>
        </div>
      </section>
      <OrderModal p={modal} onClose={() => setModal(null)} />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="bg-white pt-[140px] pb-20 text-center text-mist">Loading catalog…</div>}>
      <ProductsInner />
    </Suspense>
  );
}
