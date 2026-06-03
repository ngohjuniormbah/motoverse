"use client";
import { useState } from "react";
const SUBJECTS = ["Part request", "Order question", "Bulk / trade enquiry", "Other"];
export default function Contact() {
  const [f, setF] = useState({ name: "", email: "", phone: "", vehicle: "", subject: "Part request", message: "" });
  const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!f.name || !f.email || !f.message) return; setBusy(true);
    try { await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, message: `[${f.subject}] ${f.message}` }) }); } catch {}
    setSent(true); setBusy(false);
  };
  return (
    <div className="bg-white text-ink">
      <section className="border-b border-line bg-cloud pt-[112px] pb-12">
        <div className="wrap text-center">
          <span className="eyebrow">Contact Us</span>
          <h1 className="h-sec mt-3 text-4xl md:text-6xl">Let&apos;s find your part.</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slatey">Send the year, make, model, and the part you need. We reply within 24 business hours.</p>
        </div>
      </section>
      <section className="py-14"><div className="wrap grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <a href="mailto:motoversespareparts@gmail.com" className="card flex items-center gap-3 p-6 hover:border-blue">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue/10 text-blue"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="18" height="14" rx="2" /><path d="m1 5 9 6 9-6" /></svg></span>
            <div><div className="text-sm text-mist">Email us</div><div className="font-semibold">motoversespareparts@gmail.com</div></div>
          </a>
          <div className="card p-6">
            <h3 className="font-bold">Our Hubs</h3>
            <ul className="mt-3 space-y-2 text-[15px] text-slatey">
              <li className="flex justify-between border-b border-line pb-2"><span>Ohio</span><span className="text-mist">Midwest</span></li>
              <li className="flex justify-between border-b border-line pb-2"><span>Florida</span><span className="text-mist">Southeast</span></li>
              <li className="flex justify-between"><span>Austin, Texas</span><span className="text-mist">Southwest</span></li>
            </ul>
          </div>
          <div className="rounded-2xl bg-blue/5 border border-blue/20 p-6"><p className="text-[15px] text-slatey">We ship to <span className="font-bold text-blue">all 50 states</span>. No payment online — we confirm your order and arrange payment &amp; delivery by phone or email.</p></div>
        </div>
        <div className="card p-7 md:p-9">
          {sent ? (
            <div className="grid h-full min-h-[360px] place-items-center text-center"><div>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blue/10 text-blue"><svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12l5 5L20 5" /></svg></div>
              <h3 className="mt-5 font-display text-2xl font-extrabold">Message sent!</h3>
              <p className="mt-2 text-slatey">We&apos;ll get back to you within 24 hours.</p>
              <button onClick={() => { setSent(false); setF({ name: "", email: "", phone: "", vehicle: "", subject: "Part request", message: "" }); }} className="btn btn-ghost mt-6">Send another</button>
            </div></div>
          ) : (
            <>
              <h2 className="font-display text-2xl font-extrabold">Send us a message</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <input className="input" placeholder="Name *" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                <input className="input" type="email" placeholder="Email *" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
                <input className="input" placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
                <input className="input" placeholder="Vehicle (year/make/model)" value={f.vehicle} onChange={(e) => setF({ ...f, vehicle: e.target.value })} />
                <select className="input sm:col-span-2" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select>
                <textarea className="input sm:col-span-2" rows={5} placeholder="What part do you need? *" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
              </div>
              <button onClick={submit} disabled={busy} className="btn btn-blue mt-6 w-full disabled:opacity-50">{busy ? "Sending…" : "Send message"}</button>
            </>
          )}
        </div>
      </div></section>
    </div>
  );
}
