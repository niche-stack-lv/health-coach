/**
 * POST /api/coach/delete-client
 *
 * Body: { clientId: string }
 * Auth: caller must send Authorization: Bearer <supabase access token>
 *       and be a coach who owns this client.
 *
 * Deletes the auth user, which cascades via FK ON DELETE CASCADE to
 * profiles → clients → all client-owned data (check_ins, food_check_ins,
 * measurements, habits, habit_logs, diet_plans, workout_plans,
 * workout_assignments, template_assignments, client_onboarding).
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server config missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function callerCoachId(request: Request): Promise<string | null> {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const sb = createClient(url, anon, { auth: { persistSession: false } });
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return null;
  const { data: prof } = await admin()
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  return prof?.role === "coach" ? data.user.id : null;
}

export async function POST(request: Request) {
  const coachId = await callerCoachId(request);
  if (!coachId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { clientId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const clientId = (body.clientId || "").trim();
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const sb = admin();

  // Verify the caller owns this client so a coach can't delete another
  // coach's client by guessing an id.
  const { data: client, error: lookupErr } = await sb
    .from("clients")
    .select("id, coach_id")
    .eq("id", clientId)
    .maybeSingle();
  if (lookupErr) return NextResponse.json({ error: lookupErr.message }, { status: 400 });
  if (!client) return NextResponse.json({ error: "client not found" }, { status: 404 });
  if (client.coach_id !== coachId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Delete the auth user. FK cascades handle profiles → clients → all
  // client-owned rows in one shot.
  const { error: delErr } = await sb.auth.admin.deleteUser(clientId);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
