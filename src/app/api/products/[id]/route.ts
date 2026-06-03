import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
function ok(req: NextRequest) { return req.headers.get("x-admin-pw") === (process.env.ADMIN_PASSWORD || "motoverse"); }

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!ok(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  const b = await req.json();
  const data: any = {};
  for (const k of ["name","brand","make","category","price","badge","description","image"]) if (b[k] !== undefined) data[k] = b[k];
  if (b.stock !== undefined) data.stock = Number(b.stock) || 0;
  if (b.featured !== undefined) data.featured = !!b.featured;
  const { data: product, error } = await sb.from("products").update(data).eq("id", Number(params.id)).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!ok(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  await sb.from("products").delete().eq("id", Number(params.id));
  return NextResponse.json({ ok: true });
}
