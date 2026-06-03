"use client";
import { createContext, useContext, useState, useCallback } from "react";
import Link from "next/link";
import type { Product } from "./products";

interface CartItem extends Product { qty: number; }
interface CartCtx {
  items: CartItem[]; open: boolean;
  add: (p: Product) => void; remove: (id: number) => void;
  setQty: (id: number, q: number) => void; clear: () => void;
  toggle: () => void; close: () => void;
}
const Ctx = createContext<CartCtx | null>(null);
export const useCart = () => { const c = useContext(Ctx); if (!c) throw new Error("useCart outside provider"); return c; };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const add = useCallback((p: Product) => {
    setItems((s) => {
      const e = s.find((i) => i.id === p.id);
      if (e) return s.map((i) => i.id === p.id ? { ...i, qty: Math.min(99, i.qty + 1) } : i);
      return [...s, { ...p, qty: 1 }];
    });
    setOpen(true);
  }, []);
  const remove = useCallback((id: number) => setItems((s) => s.filter((i) => i.id !== id)), []);
  const setQty = useCallback((id: number, q: number) => setItems((s) => s.map((i) => i.id === id ? { ...i, qty: Math.max(1, q) } : i)), []);
  const clear = useCallback(() => setItems([]), []);
  return (
    <Ctx.Provider value={{ items, open, add, remove, setQty, clear, toggle: () => setOpen((v) => !v), close: () => setOpen(false) }}>
      {children}
      <CartDrawer />
    </Ctx.Provider>
  );
}

function CartDrawer() {
  const { items, open, close, remove, setQty } = useCart();
  const total = items.reduce((n, i) => n + parseFloat(i.price.replace(/[$,]/g, "")) * i.qty, 0);
  return (
    <>
      <div onClick={close} className={`fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside className={`fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-white border-l border-line transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-line p-5">
          <h3 className="font-display text-xl font-extrabold text-ink">Your Cart</h3>
          <button onClick={close} className="grid h-9 w-9 place-items-center rounded-lg border border-line hover:bg-cloud">✕</button>
        </div>
        {items.length === 0 ? (
          <div className="p-10 text-center text-mist">Your cart is empty.</div>
        ) : (
          <>
            <div className="max-h-[calc(100%-210px)] overflow-y-auto p-5 space-y-4">
              {items.map((i) => (
                <div key={i.id} className="flex gap-3">
                  <img src={i.image} alt={i.name} className="h-16 w-16 rounded-lg border border-line object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">{i.name}</p>
                    <p className="font-mono text-xs text-mist">{i.price}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <button onClick={() => setQty(i.id, i.qty - 1)} className="h-6 w-6 rounded border border-line">−</button>
                      <span className="w-7 text-center font-mono text-sm">{i.qty}</span>
                      <button onClick={() => setQty(i.id, i.qty + 1)} className="h-6 w-6 rounded border border-line">+</button>
                      <button onClick={() => remove(i.id)} className="ml-auto text-xs text-mist hover:text-blue">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 inset-x-0 border-t border-line bg-white p-5">
              <div className="mb-4 flex justify-between"><span className="text-slatey">Subtotal</span><span className="font-mono text-xl font-bold text-ink">${total.toFixed(2)}</span></div>
              <Link href="/cart" onClick={close} className="btn btn-blue w-full">Checkout</Link>
              <p className="mt-3 text-center text-xs text-mist">No payment online — we contact you to arrange delivery &amp; payment.</p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
