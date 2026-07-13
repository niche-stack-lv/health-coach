/**
 * POST /api/coach/send-reset-link
 *
 * Body: { clientId: string }
 * Auth: caller must send Authorization: Bearer <supabase access token>
 *       and be a coach who owns this client.
 *
 * Generates a Supabase recovery link for the client and emails it via
 * Resend using our branded welcome template. Useful when the original
 * welcome email failed to deliver or the client lost the link.
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendClientWelcomeEmail } from "@/lib/email";

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

  // Verify ownership and fetch the profile in one hop.
  const { data: client, error: lookupErr } = await sb
    .from("clients")
    .select("id, coach_id, profile:profiles!clients_id_fkey(email, name)")
    .eq("id", clientId)
    .maybeSingle();
  if (lookupErr) return NextResponse.json({ error: lookupErr.message }, { status: 400 });
  if (!client) return NextResponse.json({ error: "client not found" }, { status: 404 });
  if (client.coach_id !== coachId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const profile = Array.isArray(client.profile) ? client.profile[0] : client.profile;
  const email = (profile?.email || "").trim();
  const name  = (profile?.name  || "").trim();
  if (!email) return NextResponse.json({ error: "client has no email on file" }, { status: 400 });

  // Generate a fresh recovery link that lands on our /reset-password page.
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const redirectTo = site ? `${site.replace(/\/$/, "")}/reset-password` : undefined;
  const { data: linkData, error: linkErr } = await sb.auth.admin.generateLink({
    type: "recovery",
    email,
    options: redirectTo ? { redirectTo } : undefined,
  });
  if (linkErr || !linkData.properties?.action_link) {
    return NextResponse.json({ error: linkErr?.message || "generateLink failed" }, { status: 400 });
  }
  const setPasswordUrl = linkData.properties.action_link;

  const emailResult = await sendClientWelcomeEmail({ to: email, name, setPasswordUrl });
  if ("error" in emailResult) {
    return NextResponse.json({ error: emailResult.error }, { status: 500 });
  }
  if ("skipped" in emailResult) {
    return NextResponse.json({ error: "email service not configured" }, { status: 503 });
  }

  return NextResponse.json({ ok: true, sentTo: email });
}
