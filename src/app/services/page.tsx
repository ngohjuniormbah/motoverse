"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { threshold: .12 });
    ref.current?.querySelectorAll(".reveal").forEach((el) => io.observe(el)); return () => io.disconnect();
  }, []); return ref;
}
const SERVICES = [
  { tag:"01 — Parts Supply", t:"OEM & Aftermarket Parts", d:"Thousands of genuine and high-performance aftermarket parts for every major make and model, inspected and warrantied before shipping.", points:["Engine, brakes, suspension, electrical, body & interior","New, used, and refurbished options","Manufacturer warranties","Verified fitment by year/make/model"], img:"https://images.unsplash.com/photo-1605164599901-db7f68c4b1c0?w=900&q=80" },
  { tag:"02 — Rare Sourcing", t:"Rare & Discontinued Sourcing", d:"Send us your vehicle's year, make, and model plus the part. We tap our nationwide supplier network to track down rare and out-of-production parts.", points:["Discontinued and hard-to-find parts","Salvage and OEM-surplus channels","24-hour quote turnaround","No-obligation requests"], img:"https://images.unsplash.com/photo-1632823471565-1ecdf5c6da77?w=900&q=80" },
  { tag:"03 — Delivery", t:"Nationwide Delivery & Shipping", d:"We deliver to all 50 states and ship directly to your home or garage. Fast dispatch, tracked shipping, and full insurance on every order.", points:["Ships to all 50 states","Most orders dispatch within 24 hours","Tracked and insured","Regional hubs for faster delivery"], img:"https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=900&q=80" },
  { tag:"04 — Trade", t:"Bulk & Trade Pricing", d:"Garages and body shops get tiered pricing, a dedicated rep, and consolidated shipping across our hubs.", points:["Volume-based tiered pricing","Dedicated account rep","Consolidated shipping","Priority sourcing"], img:"https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=900&q=80" },
];
export default function Services() {
  const ref = useReveal();
  return (
    <div ref={ref} className="bg-white text-ink">
      <section className="border-b border-line bg-cloud pt-[112px] pb-16">
        <div className="wrap">
          <span className="eyebrow">Our Services</span>
          <h1 className="h-sec mt-3 max-w-3xl text-4xl md:text-6xl">More than a parts store.</h1>
          <p className="mt-5 max-w-2xl text-lg text-slatey">From sourcing the impossible to shipping nationwide — everything Motoverse does for drivers and shops.</p>
        </div>
      </section>
      <section className="py-16"><div className="wrap space-y-16">
        {SERVICES.map((s, i) => (
          <div key={i} className={`reveal grid items-center gap-10 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <div className="overflow-hidden rounded-3xl border border-line shadow-card"><img src={s.img} alt={s.t} className="h-full max-h-[360px] w-full object-cover" /></div>
            <div>
              <span className="font-mono text-sm font-bold text-blue">{s.tag}</span>
              <h2 className="h-sec mt-2 text-3xl md:text-4xl">{s.t}</h2>
              <p className="mt-4 leading-relaxed text-slatey">{s.d}</p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {s.points.map((p) => <li key={p} className="flex items-start gap-2.5 text-[15px] text-ink"><svg className="mt-0.5 flex-none" width="18" height="18" fill="none" stroke="#2563EB" strokeWidth="2.5"><path d="M3 9l4 4 8-9" /></svg>{p}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div></section>
      <section className="pb-16"><div className="wrap"><div className="reveal rounded-3xl bg-blue px-8 py-14 text-center text-white">
        <h2 className="font-display text-4xl font-extrabold md:text-5xl">Ready to get the part you need?</h2>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/products" className="btn btn-white">Shop Parts</Link>
          <Link href="/contact" className="btn border border-white/40 text-white hover:bg-white/10">Request a Part</Link>
        </div>
      </div></div></section>
    </div>
  );
}
