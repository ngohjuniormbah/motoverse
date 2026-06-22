"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";

export function ProductCard({ p, onOpen }: { p: Product; onOpen: (p: Product) => void }) {
  return (
    <div className="card group flex flex-col overflow-hidden text-left">
      <button onClick={() => onOpen(p)} className="relative block aspect-[4/3] w-full overflow-hidden bg-cloud">
        {p.badge && <span className="absolute left-3 top-3 z-10 rounded-md bg-blue px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">{p.badge}</span>}
        <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </button>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-[11px] uppercase tracking-wide text-mist">{p.make} · {p.brand}</p>
        <p className="mt-1.5 line-clamp-2 text-[15px] font-bold leading-snug text-ink">{p.name}</p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slatey">{p.description}</p>
        <button onClick={() => onOpen(p)} className="btn btn-blue mt-4 w-full">Place an order</button>
      </div>
    </div>
  );
}

const STATES = ["Ohio", "Florida", "Texas", "California", "New York", "Other"];

export function OrderModal({ p, onClose }: { p: Product | null; onClose: () => void }) {
  const { add } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", state: "Ohio", address: "", notes: "" });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!form.name || !form.phone || !form.address || !p) return;
    setBusy(true);
    try { await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, product: p.name, price: p.price }) }); setSent(true); }
    catch { setSent(true); }
    setBusy(false);
  };
  return (
    <AnimatePresence>
      {p && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
          className="fixed inset-0 z-[80] grid place-items-center bg-ink/50 backdrop-blur-md p-4">
          <motion.div initial={{ scale: .95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: .95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} className="grid max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white md:grid-cols-2">
            <div className="min-h-[260px] bg-cover bg-center" style={{ backgroundImage: `url(${p.image})` }} />
            <div className="relative p-7">
              <button onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg bg-cloud text-ink hover:bg-blue hover:text-white">✕</button>
              <p className="font-mono text-xs uppercase tracking-wide text-mist">{p.make} · {p.brand} · {p.category}</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-ink">{p.name}</h2>
              {sent ? (
                <div className="mt-5 rounded-xl border border-blue/20 bg-blue/5 p-5 text-center">
                  <p className="font-display text-xl font-extrabold text-blue">Order received!</p>
                  <p className="mt-2 text-sm text-slatey">We&apos;ll contact you shortly to confirm and arrange delivery &amp; payment.</p>
                  <button onClick={onClose} className="btn btn-ghost mt-4">Close</button>
                </div>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-slatey">{p.description}</p>
                  <div className="mt-4 space-y-2.5">
                    <input className="input" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <input className="input" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    <select className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>{STATES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
                    <input className="input" placeholder="Delivery address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    <input className="input" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                  <button onClick={submit} disabled={busy} className="btn btn-blue mt-4 w-full disabled:opacity-50">{busy ? "Sending…" : "Place order"}</button>
                  <button onClick={() => { add(p); onClose(); }} className="btn btn-ghost mt-2 w-full">Add to cart instead</button>
                  <p className="mt-3 text-center text-xs text-mist">No payment now — we contact you to arrange delivery &amp; payment.</p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
