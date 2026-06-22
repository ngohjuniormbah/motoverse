"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";

type Variant = "hero" | "header" | "inline";

export function SearchBar({ variant = "inline", placeholder = "Search for any part…" }: { variant?: Variant; placeholder?: string }) {
  const { add } = useCart();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [sourced, setSourced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [added, setAdded] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();
  const seq = useRef(0);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Full search: catalog first, transparently sourced from the web on a miss —
  // the customer just sees results either way.
  const runSearch = useCallback(async (term: string) => {
    const id = ++seq.current;
    setBusy(true);
    setFailed(false);
    setOpen(true);
    try {
      const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      const d = await r.json();
      if (id !== seq.current) return;
      setResults(d.products || []);
      setSourced(!!d.sourced);
      setFailed(!d.products?.length);
    } catch {
      if (id !== seq.current) return;
      setResults([]);
      setFailed(true);
    }
    if (id === seq.current) setBusy(false);
  }, []);

  // Live results while typing: instant catalog matches, and if the catalog has
  // nothing, the full search kicks in by itself after the customer pauses.
  const onType = (value: string) => {
    setQ(value);
    setFailed(false);
    clearTimeout(debounce.current);
    const term = value.trim();
    if (term.length < 2) { seq.current++; setResults([]); setSourced(false); setBusy(false); setOpen(false); return; }
    debounce.current = setTimeout(async () => {
      const id = ++seq.current;
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(term)}&suggest=1`);
        const d = await r.json();
        if (id !== seq.current) return;
        const hits: Product[] = d.products || [];
        if (hits.length) { setResults(hits); setSourced(false); setOpen(true); return; }
      } catch { /* fall through to full search */ }
      if (id !== seq.current) return;
      if (term.length >= 4) runSearch(term);
      else { setResults([]); setSourced(false); setOpen(false); }
    }, 400);
  };

  const submit = useCallback(() => {
    const term = q.trim();
    if (!term || busy) return;
    clearTimeout(debounce.current);
    runSearch(term);
  }, [q, busy, runSearch]);

  // Web-sourced parts (temporary negative id) are saved into the catalog the
  // moment a customer adds one to their cart.
  const onAdd = async (p: Product) => {
    const tempId = p.id;
    let item = p;
    if (p.id < 0) {
      try {
        const r = await fetch("/api/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
        const d = await r.json();
        if (d.product) {
          item = d.product;
          setResults((rs) => rs.map((x) => (x.id === tempId ? d.product : x)));
        }
      } catch { /* still add the temp item so the customer isn't blocked */ }
    }
    add(item);
    setAdded(item.id);
    setTimeout(() => setAdded(null), 1500);
  };

  const compact = variant === "header";
  const wrapCls =
    variant === "hero" ? "flex w-full flex-col gap-2 rounded-2xl bg-white p-2.5 shadow-soft sm:flex-row"
    : compact ? "flex w-full items-center gap-1.5 rounded-xl border border-line bg-white p-1"
    : "flex w-full flex-col gap-2 rounded-2xl border border-line bg-white p-2 sm:flex-row";

  return (
    <div ref={boxRef} className="relative w-full">
      <div className={wrapCls}>
        <input
          value={q}
          onChange={(e) => onType(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={compact
            ? "w-full min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-mist focus:outline-none"
            : "input flex-1 border-0 ring-0 focus:ring-0"}
        />
        <button onClick={submit} disabled={busy}
          className={compact
            ? "grid h-9 w-9 flex-none place-items-center rounded-lg bg-blue text-white transition-colors hover:bg-bluedark disabled:opacity-50"
            : "btn btn-blue flex-none disabled:opacity-60 sm:px-8"}
          title="Search">
          {busy
            ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            : compact
              ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="7" r="5" /><path d="m11 11 4 4" /></svg>
              : "Search"}
        </button>
      </div>

      {open && q.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-50 max-h-[420px] overflow-y-auto rounded-2xl border border-line bg-white p-2 text-left shadow-card">
          {busy && results.length === 0 ? (
            <div className="flex items-center gap-3 p-4 text-sm text-slatey">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue/30 border-t-blue" />
              Finding your part…
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-cloud">
                  <img src={p.image} alt={p.name} className="h-12 w-12 flex-none rounded-lg border border-line object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{p.name}</p>
                    <p className="truncate font-mono text-xs text-mist">{p.make} · {p.brand}</p>
                  </div>
                  <button onClick={() => onAdd(p)}
                    className={`flex-none rounded-lg px-3 py-2 text-xs font-bold transition-colors ${added === p.id ? "bg-emerald-500 text-white" : "bg-blue text-white hover:bg-bluedark"}`}>
                    {added === p.id ? "Added ✓" : "Add to cart"}
                  </button>
                </div>
              ))}
              {!sourced && (
                <Link href={`/products?q=${encodeURIComponent(q.trim())}`} onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-center text-xs font-bold text-blue hover:bg-cloud">
                  See all results →
                </Link>
              )}
            </>
          ) : failed ? (
            <div className="p-4 text-sm text-slatey">
              We couldn&apos;t load results for “{q.trim()}” — <Link href="/contact" className="font-bold text-blue" onClick={() => setOpen(false)}>send us a request</Link> and we&apos;ll get back to you within 24 hours.
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 text-sm text-slatey">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue/30 border-t-blue" />
              Finding your part…
            </div>
          )}
        </div>
      )}
    </div>
  );
}
