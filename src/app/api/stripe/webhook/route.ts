/**
 * Stripe webhook — auto-provisions a DesiSquats client account after payment.
 *
 * Trigger: `checkout.session.completed` (fired by both Payment Links and full
 * Checkout Sessions).
 *
 * What it does (idempotently):
 *   1. Verify the request signature with STRIPE_WEBHOOK_SECRET.
 *   2. Pull the buyer's email + name off the session.
 *   3. If no auth user with that email exists, create one via the Supabase
 *      service role (random password; email_confirm=true so they can immediately
 *      reset without an extra confirm step).
 *   4. Upsert profiles (role='client') and clients (linked to the DesiSquats
 *      coach). Status is set from the session's plan metadata when present.
 *   5. Trigger a password-reset email so the buyer can pick their own password
 *      and log in.
 *
 * Env required:
 *   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY,
 *   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_DESISQUATS_COACH_ID
 *
 * Stripe setup:
 *   1. Dashboard → Developers → Webhooks → Add endpoint
 *      URL: https://<your-domain>/api/stripe/webhook
 *      Event: checkout.session.completed
 *   2. Copy the signing secret → STRIPE_WEBHOOK_SECRET.
 *   3. On each Payment Link, add metadata { plan: "guided" | "coach_led" }
 *      so the webhook can tag the client with the right plan.
 */
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { sendClientWelcomeEmail } from "@/lib/email";

// The Next.js App Router expects raw text/arrayBuffer for signature verification.
export const runtime = "nodejs";

const {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_DESISQUATS_COACH_ID,
} = process.env;

const REDIRECT_TO = "/reset-password"; // where the user lands after clicking the reset link

function admin() {
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase URL or service-role key is not configured.");
  }
  return createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function randomPassword() {
  return crypto.randomUUID().replace(/-/g, "") + "aA1!";
}

/** Look up an auth user by email, paginating through the admin list. */
async function findAuthUserByEmail(sb: ReturnType<typeof admin>, email: string) {
  const wanted = email.toLowerCase();
  let page = 1;
  while (page < 20) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => (u.email || "").toLowerCase() === wanted);
    if (hit) return hit;
    if (data.users.length < 200) return null;
    page++;
  }
  return null;
}

/**
 * Infer the plan slug (`guided` | `coach_led`) from a Checkout Session.
 *
 * Preference order:
 *   1. `metadata.plan` on the session or on the Payment Link (explicit).
 *   2. Line-item product name — matches on "coach" / "guided" substrings so it
 *      keeps working even if the exact copy changes.
 */
async function inferPlan(
  stripe: Stripe,
  session: Stripe.Checkout.Session
): Promise<string> {
  const meta = (session.metadata?.plan || "").toString().trim();
  if (meta) return meta;

  const linkMeta = (session as unknown as { payment_link?: Stripe.PaymentLink })
    .payment_link?.metadata?.plan;
  if (linkMeta) return String(linkMeta).trim();

  // Re-fetch with line items + products expanded so we can pattern-match names.
  const full = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items.data.price.product"],
  });
  const name = (full.line_items?.data?.[0]?.price?.product as Stripe.Product | undefined)?.name || "";
  const lower = name.toLowerCase();
  if (lower.includes("coach")) return "coach_led";
  if (lower.includes("guided")) return "guided";
  return "";
}

async function provisionClient(stripe: Stripe, session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email || session.customer_email;
  if (!email) return { ok: false, reason: "no email on session" };

  const name = session.customer_details?.name || email.split("@")[0];
  const plan = await inferPlan(stripe, session);

  const sb = admin();

  // 1. Ensure an auth user exists. We never surface a password — the buyer
  // sets their own via the recovery link emailed in step 4.
  let userId: string;
  let isNewUser = false;
  const existing = await findAuthUserByEmail(sb, email);
  if (existing) {
    userId = existing.id;
  } else {
    isNewUser = true;
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password: randomPassword(), // throwaway; will be replaced on first login
      email_confirm: true,
      user_metadata: { name, source: "stripe_checkout", plan },
    });
    if (error || !data.user) throw new Error(error?.message || "createUser failed");
    userId = data.user.id;
  }

  // 2. Upsert profile as a client.
  const { error: profileError } = await sb
    .from("profiles")
    .upsert(
      { id: userId, email, name, role: "client" },
      { onConflict: "id" }
    );
  if (profileError) throw new Error(`profiles upsert: ${profileError.message}`);

  // 3. Upsert client row linked to the DesiSquats coach.
  if (!NEXT_PUBLIC_DESISQUATS_COACH_ID) throw new Error("NEXT_PUBLIC_DESISQUATS_COACH_ID missing");
  const { error: clientError } = await sb
    .from("clients")
    .upsert(
      {
        id: userId,
        coach_id: NEXT_PUBLIC_DESISQUATS_COACH_ID,
        status: "active",
        goal: plan === "coach_led" ? "The Coach-Led Journey" : plan === "guided" ? "The Guided Journey" : null,
      },
      { onConflict: "id" }
    );
  if (clientError) throw new Error(`clients upsert: ${clientError.message}`);

  // 4. Email a "set your password" invite. Same template for new and
  //    returning users — the link takes them to the recovery flow so nobody
  //    ever sees a plaintext password.
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const redirectTo = site ? `${site.replace(/\/$/, "")}${REDIRECT_TO}` : undefined;
  const { data: linkData, error: linkErr } = await sb.auth.admin.generateLink({
    type: "recovery",
    email,
    options: redirectTo ? { redirectTo } : undefined,
  });
  if (linkErr || !linkData.properties?.action_link) {
    console.warn("[stripe] generateLink failed", linkErr);
  } else {
    const emailResult = await sendClientWelcomeEmail({
      to: email,
      name,
      setPasswordUrl: linkData.properties.action_link,
    });
    if ("error" in emailResult) console.warn("welcome email:", emailResult.error);
  }

  return { ok: true, userId, plan, isNewUser };
}

export async function POST(request: Request) {
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "stripe not configured" }, { status: 503 });
  }
  const stripe = new Stripe(STRIPE_SECRET_KEY);

  const sig = request.headers.get("stripe-signature") || "";
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `signature: ${(err as Error).message}` }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  // Only provision when payment actually succeeded.
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, unpaid: true });
  }

  try {
    const result = await provisionClient(stripe, session);
    return NextResponse.json({ received: true, ...result });
  } catch (err) {
    console.error("[stripe webhook] provision failed", err);
    // Return 500 so Stripe retries.
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
