"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";
import { SearchBar } from "./SearchBar";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/services", label: "Services" },
  { href: "/#brands", label: "Brands" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { items, toggle } = useCart();
  const count = items.reduce((n, i) => n + i.qty, 0);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    f(); addEventListener("scroll", f); return () => removeEventListener("scroll", f);
  }, []);
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-xl border-b border-line shadow-sm" : "bg-white border-b border-transparent"}`}>
      <div className="wrap flex h-[72px] items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-xl font-extrabold tracking-tight text-ink">Motoverse</span>
        </Link>
        <nav className="hidden gap-8 md:flex">
          {NAV.map((n) => <Link key={n.href} href={n.href} className="text-[15px] font-semibold text-slatey transition-colors hover:text-blue">{n.label}</Link>)}
        </nav>
        <div className="hidden w-72 lg:block">
          <SearchBar variant="header" placeholder="Search any part…" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="relative grid h-10 w-10 place-items-center rounded-lg border border-line text-ink transition-colors hover:border-blue hover:text-blue" title="Cart">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="17" r="1.5" /><circle cx="15" cy="17" r="1.5" /><path d="M1 1h3l2.2 11h9.5L18 4H5" /></svg>
            {count > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-blue px-1 text-[10px] font-bold text-white">{count}</span>}
          </button>
          <Link href="/products" className="btn btn-blue hidden md:inline-flex">Shop Now</Link>
          <button onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-lg border border-line text-ink md:hidden">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d={open ? "M4 4l10 10M14 4L4 14" : "M2 5h14M2 9h14M2 13h14"} /></svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-line bg-white md:hidden">
          <div className="wrap flex flex-col py-2">
            <div className="py-2">
              <SearchBar variant="header" placeholder="Search any part…" />
            </div>
            {NAV.map((n) => <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="py-3 font-semibold text-slatey">{n.label}</Link>)}
          </div>
        </div>
      )}
    </header>
  );
}
