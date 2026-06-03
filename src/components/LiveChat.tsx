"use client";
import { useState } from "react";

export function LiveChat() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!f.name || !f.message) return;
    setBusy(true);
    try {
      await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, message: `[Live chat] ${f.message}` }),
      });
    } catch {}
    setSent(true); setBusy(false);
  };

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[90] grid h-14 w-14 place-items-center rounded-full bg-blue text-white shadow-lg transition-transform hover:scale-105"
        aria-label="Live chat">
        {open
          ? <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4l14 14M18 4L4 18" /></svg>
          : <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v12H7l-3 3z" /></svg>}
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-[90] w-[340px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
          <div className="bg-blue px-5 py-4 text-white">
            <div className="font-display text-lg font-extrabold">Motoverse Support</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-sm text-white/85"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Typically replies within an hour</div>
          </div>
          {sent ? (
            <div className="p-6 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blue/10 text-blue"><svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12l5 5L20 5" /></svg></div>
              <p className="mt-4 font-bold text-ink">Message sent!</p>
              <p className="mt-1 text-sm text-slatey">We&apos;ll get back to you shortly.</p>
              <button onClick={() => { setSent(false); setF({ name: "", email: "", message: "" }); }} className="btn btn-ghost mt-4 w-full">Send another</button>
            </div>
          ) : (
            <div className="p-5">
              <div className="rounded-xl bg-cloud p-3 text-sm text-slatey">👋 Hi! Looking for a part or have a question? Leave a message and our team will reply fast.</div>
              <div className="mt-4 space-y-2.5">
                <input className="input" placeholder="Your name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                <input className="input" placeholder="Email (optional)" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
                <textarea className="input" rows={3} placeholder="How can we help?" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
              </div>
              <button onClick={send} disabled={busy} className="btn btn-blue mt-3 w-full disabled:opacity-50">{busy ? "Sending…" : "Send message"}</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
