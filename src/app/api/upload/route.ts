import { NextRequest, NextResponse } from "next/server";
import { getSupabase, BUCKET } from "@/lib/supabase";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-pw") !== (process.env.ADMIN_PASSWORD || "motoverse"))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: "Supabase Storage not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." }, { status: 500 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await sb.storage.from(BUCKET).upload(path, bytes, { contentType: file.type || "image/jpeg", upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
