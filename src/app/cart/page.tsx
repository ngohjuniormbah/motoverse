"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
const STATES = ["Ohio", "Florida", "Texas", "California", "New York", "Other"];
export default function CartPage() {
  const { items, setQty, remove, clear } = useCart();
  const [f, setF] = useState({ name: "", email: "", phone: "", state: "Ohio", address: "", notes: "" });
  const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false); const [orderNo, setOrderNo] = useState<number | null>(null);
  const total = items.reduce((n, i) => n + parseFloat(i.price.replace(/[$,]/g, "")) * i.qty, 0);
  const submit = async () => {
    if (!f.name || !f.phone || !f.address || items.length === 0) return; setBusy(true);
    try {
      const r = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, product: items.map((i) => `${i.qty}× ${i.name}`).join(", "), price: `$${total.toFixed(2)}` }) });
      const d = await r.json(); setOrderNo(d.id ?? null);
    } catch {}
    clear(); setSent(true); setBusy(false);
  };
  if (sent) return (
    <div className="bg-white text-ink"><section className="grid min-h-[70vh] place-items-center px-6 pt-24 pb-20 text-center"><div>
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-blue/10 text-blue"><svg width="38" height="38" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 14l6 6L27 6" /></svg></div>
      <h1 className="mt-6 font-display text-4xl font-extrabold md:text-5xl">Order placed!</h1>
      {orderNo && <p className="mt-2 font-mono text-blue">Order #{orderNo}</p>}
      <p className="mx-auto mt-4 max-w-md text-lg text-slatey">We&apos;ll contact you shortly to confirm availability and arrange payment &amp; delivery.</p>
      <Link href="/products" className="btn btn-blue mt-8">Continue shopping</Link>
    </div></section></div>
  );
  if (items.length === 0) return (
    <div className="bg-white text-ink"><section className="grid min-h-[70vh] place-items-center px-6 pt-24 pb-20 text-center"><div>
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-line bg-cloud text-mist"><svg width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="29" r="2" /><circle cx="25" cy="29" r="2" /><path d="M2 2h5l3.5 18h16L30 7H9" /></svg></div>
      <h1 className="mt-6 font-display text-3xl font-extrabold">Your cart is empty</h1>
      <p className="mt-3 text-slatey">Add a part to get started.</p>
      <Link href="/products" className="btn btn-blue mt-7">Shop parts</Link>
    </div></section></div>
  );
  return (
    <div className="bg-white text-ink"><section className="pt-[104px] pb-20"><div className="wrap">
      <h1 className="h-sec text-4xl md:text-5xl">Cart &amp; Checkout</h1>
      <p className="mt-3 text-slatey">{items.length} item{items.length === 1 ? "" : "s"} · Review, then enter your details.</p>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          {items.map((i) => (
            <div key={i.id} className="card flex gap-4 p-4">
              <img src={i.image} alt={i.name} className="h-24 w-24 flex-none rounded-xl border border-line object-cover" />
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-bold">{i.name}</p><p className="font-mono text-sm text-mist">{i.make} · {i.price}</p></div>
                  <button onClick={() => remove(i.id)} className="text-mist hover:text-blue"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5h12M7 5V3h4v2M5 5l1 11h6l1-11" /></svg></button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-lg border border-line">
                    <button onClick={() => setQty(i.id, i.qty - 1)} className="grid h-9 w-9 place-items-center hover:bg-cloud">−</button>
                    <span className="w-10 text-center font-mono">{i.qty}</span>
                    <button onClick={() => setQty(i.id, i.qty + 1)} className="grid h-9 w-9 place-items-center hover:bg-cloud">+</button>
                  </div>
                  <span className="font-mono text-lg font-bold">${(parseFloat(i.price.replace(/[$,]/g, "")) * i.qty).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
          <button onClick={clear} className="text-sm text-mist hover:text-blue">Clear cart</button>
        </div>
        <div className="card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-extrabold">Your details</h2>
          <div className="mt-4 space-y-3">
            <input className="input" placeholder="Full name *" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            <input className="input" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            <input className="input" placeholder="Phone *" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            <select className="input" value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })}>{STATES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            <input className="input" placeholder="Delivery address *" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
            <textarea className="input" rows={2} placeholder="Notes (optional)" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          </div>
          <div className="mt-5 flex justify-between border-t border-line pt-4"><span className="font-bold">Total</span><span className="font-mono text-2xl font-extrabold">${total.toFixed(2)}</span></div>
          <button onClick={submit} disabled={busy} className="btn btn-blue mt-5 w-full disabled:opacity-50">{busy ? "Placing…" : "Place order"}</button>
          <p className="mt-3 text-center text-xs text-mist">No payment now — we contact you to arrange payment &amp; delivery.</p>
        </div>
      </div>
    </div></section></div>
  );
}
