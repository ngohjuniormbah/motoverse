"use client";
import { useState } from "react";

export function ImageUpload({ value, onChange, pw }: { value: string; onChange: (url: string) => void; pw: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const upload = async (file: File) => {
    setErr(""); setOkMsg("");
    // 8MB guard — large phone photos are the #1 cause of slow/failed uploads
    if (file.size > 8 * 1024 * 1024) {
      setErr("Image is larger than 8MB. Please use a smaller photo.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", headers: { "x-admin-pw": pw }, body: fd });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(d.error || `Upload failed (${r.status})`); }
      else if (d.url) { onChange(d.url); setOkMsg("Image uploaded ✓"); }
      else { setErr("Upload returned no URL."); }
    } catch {
      setErr("Upload failed — check your connection and try again.");
    }
    setBusy(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <label className={`btn btn-ghost cursor-pointer ${busy ? "opacity-60 pointer-events-none" : ""}`}>
          {busy ? "Uploading…" : "Upload from PC"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
        {value && <img src={value} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} className="h-12 w-12 rounded-lg border border-line object-cover" />}
      </div>
      <input className="input mt-2" placeholder="…or paste an image URL" value={value} onChange={(e) => onChange(e.target.value)} />
      {busy && <p className="mt-1 text-xs text-amber-600">Uploading to storage… this can take a few seconds on a slow connection.</p>}
      {okMsg && <p className="mt-1 text-xs text-emerald-600">{okMsg}</p>}
      {err && <p className="mt-1 text-xs text-red-500">{err}</p>}
    </div>
  );
}
