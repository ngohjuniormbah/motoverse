import Link from "next/link";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
export function Footer() {
  return (
    <footer className="border-t border-line bg-cloud pt-16 pb-8">
      <div className="wrap">
        <div className="mb-12 grid items-center gap-6 rounded-2xl border border-line bg-white p-8 md:grid-cols-2">
          <div>
            <h3 className="font-display text-2xl font-extrabold text-ink">Looking for a specific part?</h3>
            <p className="mt-2 text-sm leading-relaxed text-mist">Search our catalog — and if it&apos;s not listed, we&apos;ll find it online and add it to your cart on the spot.</p>
          </div>
          <SearchBar placeholder="Search any part…" />
        </div>
        <div className="grid gap-10 border-b border-line pb-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5"><Logo /><span className="font-display text-xl font-extrabold tracking-tight text-ink">Motoverse</span></Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist">Spare parts for every car, sourced and shipped across all 50 states. Hubs in Ohio, Florida, and Austin, Texas.</p>
          </div>
          <FCol title="Shop" links={[["All Parts","/products"],["Engine","/products"],["Brakes","/products"],["Suspension","/products"]]} />
          <FCol title="Company" links={[["Services","/services"],["Brands","/#brands"],["Contact","/contact"]]} />
          <FCol title="Contact" links={[["Email us","mailto:motoversespareparts@gmail.com"],["TikTok","#"],["Facebook","#"]]} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 pt-7">
          <span className="text-sm text-mist">© {new Date().getFullYear()} Motoverse. All rights reserved.</span>
          <span className="text-sm text-mist">No account needed — browse, order, done.</span>
        </div>
      </div>
    </footer>
  );
}
function FCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="mb-4 font-mono text-xs uppercase tracking-widest text-mist">{title}</h4>
      {links.map(([l, h]) => <Link key={l} href={h} className="block py-1.5 text-sm text-slatey transition-colors hover:text-blue">{l}</Link>)}
    </div>
  );
}
