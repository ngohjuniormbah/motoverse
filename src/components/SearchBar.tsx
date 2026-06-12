"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";

type Variant = "hero" | "header" | "inline";

export function SearchBar({ variant = "inline", placeholder = "Search any part — brakes, alternator, bumper…" }: { variant?: Variant; placeholder?: string }) {
  const { add } = useCart();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [sourced, setSourced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const [added, setAdded] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Live catalog suggestions while typing (never hits the web)
  const onType = (value: string) => {
    setQ(value);
    setSearched(false);
    setSourced(false);
    clearTimeout(debounce.current);
    if (value.trim().length < 2) { setResults([]); setOpen(false); return; }
    debounce.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(value)}&suggest=1`);
        const d = await r.json();
        setResults(d.products || []);
        setOpen(true);
      } catch { /* ignore */ }
    }, 300);
  };

  // Full search: catalog first, then sources the part from the web if missing
  const submit = useCallback(async () => {
    const term = q.trim();
    if (!term || busy) return;
    clearTimeout(debounce.current);
    setBusy(true);
    setOpen(true);
    setSearched(false);
    try {
      const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      const d = await r.json();
      setResults(d.products || []);
      setSourced(!!d.sourced);
    } catch {
      setResults([]);
      setSourced(false);
    }
    setSearched(true);
    setBusy(false);
  }, [q, busy]);

  const onAdd = (p: Product) => {
    add(p);
    setAdded(p.id);
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
            ? <span className={`inline-block animate-spin rounded-full border-2 border-white/40 border-t-white ${compact ? "h-4 w-4" : "h-4 w-4"}`} />
            : compact
              ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="7" r="5" /><path d="m11 11 4 4" /></svg>
              : "Search"}
        </button>
      </div>

      {open && (q.trim().length >= 2) && (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-50 max-h-[420px] overflow-y-auto rounded-2xl border border-line bg-white p-2 text-left shadow-card">
          {busy ? (
            <div className="flex items-center gap-3 p-4 text-sm text-slatey">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue/30 border-t-blue" />
              Checking our catalog… not there? We&apos;re finding it online for you.
            </div>
          ) : results.length > 0 ? (
            <>
              {sourced && (
                <div className="mb-1 rounded-xl bg-blue/5 px-4 py-2.5 text-xs font-semibold text-blue">
                  Not in our catalog yet — we found it online and added it for you. We&apos;ll confirm exact price &amp; fitment before shipping.
                </div>
              )}
              {results.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-cloud">
                  <img src={p.image} alt={p.name} className="h-12 w-12 flex-none rounded-lg border border-line object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{p.name}</p>
                    <p className="truncate font-mono text-xs text-mist">{p.make} · {p.brand} · {p.price}</p>
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
                  See all results in the catalog →
                </Link>
              )}
            </>
          ) : searched ? (
            <div className="p-4 text-sm text-slatey">
              Couldn&apos;t source “{q.trim()}” automatically — <Link href="/contact" className="font-bold text-blue" onClick={() => setOpen(false)}>send us a request</Link> and we&apos;ll find it within 24 hours.
            </div>
          ) : (
            <button onClick={submit} className="w-full rounded-xl p-4 text-left text-sm text-slatey hover:bg-cloud">
              No matches in the catalog yet — <span className="font-bold text-blue">press Enter to search the web</span> and we&apos;ll add it for you.
            </button>
          )}
        </div>
      )}
    </div>
  );
}
