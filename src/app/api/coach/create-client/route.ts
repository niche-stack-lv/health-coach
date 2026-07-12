/**
 * POST /api/coach/create-client
 *
 * Body: { email: string, name: string, goal?: string }
 * Auth: caller must send Authorization: Bearer <supabase access token>
 *       and be a coach (checked via profiles.role).
 *
 * Server-side flow (idempotent-ish):
 *   1. Create the Supabase Auth user with email_confirm=true and a random
 *      throwaway password (the client will pick their own via the recovery
 *      link so this password is never used).
 *   2. Insert profiles(role='client') + clients(coach_id=<caller>).
 *   3. Generate a single-use recovery link and email it to the client via
 *      our Resend-branded welcome template — no plaintext password.
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendClientWelcomeEmail } from "@/lib/email";
import { randomBytes } from "node:crypto";

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

function randomPassword() {
  return randomBytes(18).toString("hex") + "aA1!";
}

export async function POST(request: Request) {
  const coachId = await callerCoachId(request);
  if (!coachId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { email?: string; name?: string; goal?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const email = (body.email || "").trim().toLowerCase();
  const name  = (body.name  || "").trim();
  const goal  = (body.goal  || "").trim();
  if (!email || !name) return NextResponse.json({ error: "email and name required" }, { status: 400 });

  const sb = admin();

  // 1. Create auth user (email_confirm so they can log in immediately after
  //    picking a password without an extra confirmation step).
  const { data: created, error: createErr } = await sb.auth.admin.createUser({
    email,
    password: randomPassword(),
    email_confirm: true,
    user_metadata: { name },
  });
  if (createErr || !created.user) {
    return NextResponse.json({ error: createErr?.message || "createUser failed" }, { status: 400 });
  }
  const userId = created.user.id;

  // 2. Insert profile + client. If either fails, clean up.
  const { error: profErr } = await sb.from("profiles").insert({ id: userId, email, name, role: "client" });
  if (profErr) {
    await sb.auth.admin.deleteUser(userId).catch(() => {});
    return NextResponse.json({ error: profErr.message }, { status: 400 });
  }
  const { error: clientErr } = await sb.from("clients").insert({
    id: userId,
    coach_id: coachId,
    goal: goal || null,
    status: "active",
  });
  if (clientErr) {
    await sb.from("profiles").delete().eq("id", userId).catch(() => {});
    await sb.auth.admin.deleteUser(userId).catch(() => {});
    return NextResponse.json({ error: clientErr.message }, { status: 400 });
  }

  // 3. Generate the "set your password" link and email it.
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const redirectTo = site ? `${site.replace(/\/$/, "")}/reset-password` : undefined;
  const { data: linkData, error: linkErr } = await sb.auth.admin.generateLink({
    type: "recovery",
    email,
    options: redirectTo ? { redirectTo } : undefined,
  });
  if (linkErr || !linkData.properties?.action_link) {
    console.warn("[create-client] generateLink failed", linkErr);
    return NextResponse.json({ ok: true, clientId: userId, emailSent: false });
  }
  const setPasswordUrl = linkData.properties.action_link;

  const emailResult = await sendClientWelcomeEmail({ to: email, name, setPasswordUrl });
  const emailSent = "ok" in emailResult;
  if (!emailSent) console.warn("[create-client] welcome email failed", emailResult);

  return NextResponse.json({ ok: true, clientId: userId, emailSent });
}
