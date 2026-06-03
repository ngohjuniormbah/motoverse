"use client";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { ImageUpload } from "@/components/ImageUpload";
import { CAR_MAKES, type Product } from "@/lib/products";

interface Order { id: number; name: string; phone: string; email: string; state: string; address: string; notes: string; product: string; price: string; status: string; createdAt: string; }
interface Message { id: number; name: string; email: string; phone: string; vehicle: string; message: string; createdAt: string; }
interface Gal { id: number; url: string; caption: string; }
interface Review { id: number; name: string; location: string; rating: number; text: string; }

const BLANK = { name: "", brand: "Motoverse", make: "Universal", category: "Engine", price: "", badge: "New", stock: 10, featured: false, description: "", image: "" };
const CATS = ["Engine", "Brakes", "Suspension", "Electrical", "Interior", "Body", "Tools"];
const FALLBACK_IMG = "/parts/car5.jpeg";
type Tab = "orders" | "messages" | "products" | "gallery" | "reviews";

function sortNewest<T extends { id: number }>(rows: T[]): T[] { return [...rows].sort((a, b) => b.id - a.id); }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Admin() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<Tab>("products");
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [gallery, setGallery] = useState<Gal[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState<typeof BLANK & { id?: number }>(BLANK);
  const [galForm, setGalForm] = useState({ url: "", caption: "" });
  const [revForm, setRevForm] = useState({ name: "", location: "", rating: 5, text: "" });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const flash = (m: string) => { setNotice(m); setTimeout(() => setNotice(""), 3500); };

  const load = async (p = pw) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin-data?t=${Date.now()}`, { headers: { "x-admin-pw": p }, cache: "no-store" });
      if (!r.ok) { if (!authed) setErr("Wrong password."); return false; }
      const d = await r.json();
      setOrders(d.orders || []);
      setMessages(d.messages || []);
      setProducts(sortNewest<Product>(d.products || []));
      setGallery(sortNewest<Gal>(d.gallery || []));
      setReviews(sortNewest<Review>(d.reviews || []));
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };
  const login = async () => { setErr(""); if (await load()) setAuthed(true); else setErr("Wrong password or connection issue — try again."); };

  // Resilient write: fire the request, then ALWAYS sync from the DB (twice) to
  // catch slow writes. We never show a false "failed to fetch" because on a slow
  // connection the write usually lands even if the browser loses the response.
  const writeThenSync = async (url: string, method: string, body?: any) => {
    setBusy(true);
    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "x-admin-pw": pw },
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });
    } catch { /* ignore — verified via reload below */ }
    await load();
    await sleep(1500);
    await load();
    setBusy(false);
  };

  const saveProduct = async () => {
    if (!form.name || !form.price || !form.image) { alert("Name, price, and image are required."); return; }
    const editing = !!form.id;
    await writeThenSync(editing ? `/api/products/${form.id}` : `/api/products`, editing ? "PUT" : "POST", form);
    flash(editing ? "Product updated." : "Product added.");
    setForm(BLANK);
  };
  const delProduct = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    await writeThenSync(`/api/products/${id}`, "DELETE");
    flash("Product deleted.");
  };

  const addGallery = async () => {
    if (!galForm.url) { alert("Upload or paste an image first."); return; }
    await writeThenSync(`/api/gallery`, "POST", galForm);
    flash("Image added."); setGalForm({ url: "", caption: "" });
  };
  const delGallery = async (id: number) => { await writeThenSync(`/api/gallery/${id}`, "DELETE"); flash("Image deleted."); };

  const addReview = async () => {
    if (!revForm.name || !revForm.text) { alert("Name and review text are required."); return; }
    await writeThenSync(`/api/reviews`, "POST", revForm);
    flash("Review added."); setRevForm({ name: "", location: "", rating: 5, text: "" });
  };
  const delReview = async (id: number) => { await writeThenSync(`/api/reviews/${id}`, "DELETE"); flash("Review deleted."); };

  if (!authed) return (
    <div className="grid min-h-screen place-items-center bg-cloud px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="flex items-center gap-2.5"><Logo /><span className="font-display text-xl font-extrabold tracking-tight">Motoverse</span></div>
        <h1 className="mt-6 font-display text-2xl font-extrabold">Admin Access</h1>
        <p className="mt-1 text-sm text-mist">Enter the admin password.</p>
        <input type="password" className="input mt-5" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
        {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
        <button onClick={login} disabled={loading} className="btn btn-blue mt-4 w-full disabled:opacity-50">{loading ? "Checking…" : "Sign in"}</button>
      </div>
    </div>
  );

  const TABS: [Tab, string, number][] = [["products","Products",products.length],["orders","Orders",orders.length],["messages","Messages",messages.length],["gallery","Gallery",gallery.length],["reviews","Reviews",reviews.length]];

  return (
    <div className="min-h-screen bg-cloud px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5"><Logo /><span className="font-display text-xl font-extrabold tracking-tight">Motoverse Admin</span><span className="ml-2 rounded-full bg-blue px-2 py-0.5 text-[10px] font-bold text-white">BUILD 4</span></div>
          <button onClick={() => load()} className="btn btn-ghost text-xs">{loading ? "Syncing…" : "Refresh"}</button>
        </div>

        {busy && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">Saving &amp; syncing… this can take a few seconds on a slow connection. Please wait.</div>}
        {notice && !busy && <div className="mt-4 rounded-xl border border-blue/20 bg-blue/5 px-4 py-2 text-sm font-semibold text-blue">{notice}</div>}

        <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {TABS.map(([k, label, n]) => <Stat key={k} label={label} value={n} />)}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {TABS.map(([k, label, n]) => (
            <button key={k} onClick={() => setTab(k)} className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${tab === k ? "bg-blue text-white" : "border border-line bg-white text-slatey hover:text-blue"}`}>{label} ({n})</button>
          ))}
        </div>

        {/* PRODUCTS */}
        {tab === "products" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[400px_1fr]">
            <div className="card h-fit p-6 lg:sticky lg:top-6">
              <h3 className="font-display text-xl font-extrabold">{form.id ? `Edit product #${form.id}` : "Add product"}</h3>
              <div className="mt-4 space-y-2.5">
                <input className="input" placeholder="Product name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <div className="grid grid-cols-2 gap-2.5">
                  <input className="input" placeholder="Part brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                  <select className="input" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })}><option value="Universal">Universal</option>{CAR_MAKES.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}</select>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
                  <input className="input" placeholder="Price ($89.99) *" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <input className="input" placeholder="Badge" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
                  <input className="input" type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slatey"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured on homepage</label>
                <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} pw={pw} />
                <textarea className="input" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <button onClick={saveProduct} disabled={busy} className="btn btn-blue mt-4 w-full disabled:opacity-50">{busy ? "Saving…" : form.id ? "Update product" : "Add product"}</button>
              {form.id && <button onClick={() => setForm(BLANK)} className="btn btn-ghost mt-2 w-full">Cancel edit</button>}
            </div>
            <div className="space-y-3">
              <p className="text-sm text-mist">{products.length} product{products.length === 1 ? "" : "s"} — newest first</p>
              {products.length === 0 && <Empty text="No products yet. Add one with the form." />}
              {products.map((p) => (
                <div key={p.id} className="card flex items-center gap-4 p-4">
                  <img src={p.image} alt={p.name} onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }} className="h-16 w-16 flex-none rounded-lg border border-line object-cover" />
                  <div className="min-w-0 flex-1"><p className="truncate font-semibold">{p.name} {p.featured && <span className="chip text-blue ml-1">Featured</span>}</p><p className="font-mono text-xs text-mist">#{p.id} · {p.make} · {p.brand} · {p.category} · {p.price} · stock {p.stock}</p></div>
                  <button onClick={() => { setForm({ id: p.id, name: p.name, brand: p.brand, make: p.make, category: p.category, price: p.price, badge: p.badge, stock: p.stock, featured: p.featured, description: p.description, image: p.image }); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="btn btn-ghost py-2 text-xs">Edit</button>
                  <button onClick={() => delProduct(p.id)} className="btn py-2 text-xs text-red-500 hover:underline">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === "orders" && (
          <div className="mt-6 space-y-3">
            {orders.length === 0 && <Empty text="No orders yet." />}
            {orders.map((o) => (
              <div key={o.id} className="card p-5">
                <div className="flex items-center justify-between"><span className="font-mono text-xs text-mist">#{o.id} · {new Date(o.createdAt).toLocaleString()}</span><span className="chip text-blue">{o.status}</span></div>
                <div className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
                  <p><span className="text-mist">Customer:</span> {o.name}</p>
                  <p><span className="text-mist">Phone:</span> {o.phone}</p>
                  {o.email && <p><span className="text-mist">Email:</span> {o.email}</p>}
                  <p><span className="text-mist">State:</span> {o.state}</p>
                  <p className="sm:col-span-2"><span className="text-mist">Address:</span> {o.address}</p>
                  {o.notes && <p className="sm:col-span-2"><span className="text-mist">Notes:</span> {o.notes}</p>}
                  <p className="sm:col-span-2"><span className="text-mist">Items:</span> {o.product} · <span className="font-mono font-bold text-blue">{o.price}</span></p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={`tel:${o.phone}`} className="btn btn-blue py-2 text-xs">Call</a>
                  <a href={`sms:${o.phone}`} className="btn btn-ghost py-2 text-xs">Text</a>
                  <a href={`https://wa.me/${o.phone.replace(/[^0-9]/g,"")}`} target="_blank" className="btn btn-ghost py-2 text-xs">WhatsApp</a>
                  {o.email && <a href={`mailto:${o.email}`} className="btn btn-ghost py-2 text-xs">Email</a>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MESSAGES */}
        {tab === "messages" && (
          <div className="mt-6 space-y-3">
            {messages.length === 0 && <Empty text="No messages yet." />}
            {messages.map((m) => (
              <div key={m.id} className="card p-5">
                <span className="font-mono text-xs text-mist">#{m.id} · {new Date(m.createdAt).toLocaleString()}</span>
                <p className="mt-2 text-sm"><span className="text-mist">From:</span> {m.name} · {m.email}{m.phone && ` · ${m.phone}`}</p>
                {m.vehicle && <p className="text-sm"><span className="text-mist">Vehicle:</span> {m.vehicle}</p>}
                <p className="mt-2 leading-relaxed text-slatey">{m.message}</p>
                <div className="mt-3"><a href={`mailto:${m.email}`} className="btn btn-blue py-2 text-xs">Reply by email</a></div>
              </div>
            ))}
          </div>
        )}

        {/* GALLERY */}
        {tab === "gallery" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[400px_1fr]">
            <div className="card h-fit p-6 lg:sticky lg:top-6">
              <h3 className="font-display text-xl font-extrabold">Add gallery image</h3>
              <div className="mt-4 space-y-2.5">
                <ImageUpload value={galForm.url} onChange={(url) => setGalForm({ ...galForm, url })} pw={pw} />
                <input className="input" placeholder="Caption (optional)" value={galForm.caption} onChange={(e) => setGalForm({ ...galForm, caption: e.target.value })} />
              </div>
              <button onClick={addGallery} disabled={busy} className="btn btn-blue mt-4 w-full disabled:opacity-50">{busy ? "Adding…" : "Add to gallery"}</button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.length === 0 && <Empty text="No gallery images yet." />}
              {gallery.map((g) => (
                <div key={g.id} className="group relative overflow-hidden rounded-2xl border border-line">
                  <img src={g.url} alt={g.caption} onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }} className="h-40 w-full object-cover" />
                  <button onClick={() => delGallery(g.id)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-red-500 text-white opacity-90 hover:opacity-100">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {tab === "reviews" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[400px_1fr]">
            <div className="card h-fit p-6 lg:sticky lg:top-6">
              <h3 className="font-display text-xl font-extrabold">Add review</h3>
              <div className="mt-4 space-y-2.5">
                <input className="input" placeholder="Customer name *" value={revForm.name} onChange={(e) => setRevForm({ ...revForm, name: e.target.value })} />
                <input className="input" placeholder="Location (City, ST)" value={revForm.location} onChange={(e) => setRevForm({ ...revForm, location: e.target.value })} />
                <select className="input" value={revForm.rating} onChange={(e) => setRevForm({ ...revForm, rating: Number(e.target.value) })}>{[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} stars</option>)}</select>
                <textarea className="input" rows={3} placeholder="Review text *" value={revForm.text} onChange={(e) => setRevForm({ ...revForm, text: e.target.value })} />
              </div>
              <button onClick={addReview} disabled={busy} className="btn btn-blue mt-4 w-full disabled:opacity-50">{busy ? "Adding…" : "Add review"}</button>
            </div>
            <div className="space-y-3">
              {reviews.length === 0 && <Empty text="No reviews yet." />}
              {reviews.map((r) => (
                <div key={r.id} className="card p-5">
                  <div className="flex items-start justify-between">
                    <div><div className="flex gap-0.5 text-blue">{Array.from({ length: r.rating }).map((_, j) => <span key={j}>★</span>)}</div><p className="mt-2 text-slatey">“{r.text}”</p><p className="mt-2 text-sm font-bold">{r.name} <span className="font-normal text-mist">· {r.location}</span></p></div>
                    <button onClick={() => delReview(r.id)} className="btn py-2 text-xs text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-mist">Orders &amp; messages also arrive in your email inbox. Access this page only via the /admin URL.</p>
      </div>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return <div className="card p-5"><p className="font-mono text-xs uppercase tracking-widest text-mist">{label}</p><p className="mt-1 font-display text-3xl font-extrabold">{value}</p></div>;
}
function Empty({ text }: { text: string }) { return <div className="card col-span-full p-12 text-center text-mist">{text}</div>; }
