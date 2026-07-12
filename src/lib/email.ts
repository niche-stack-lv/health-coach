/**
 * Server-side email helpers. Uses Resend under the hood — set RESEND_API_KEY
 * plus RESEND_FROM (something like "DesiSquats <no-reply@desisquats.com>").
 *
 * Every function here is a no-op if RESEND_API_KEY is missing so we don't
 * crash server routes in environments that haven't set up email yet.
 */
import { Resend } from "resend";

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function fromAddress(): string {
  return process.env.RESEND_FROM || "DesiSquats <onboarding@resend.dev>";
}

function loginUrl(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  return base ? `${base.replace(/\/$/, "")}/login` : "/login";
}

interface WelcomeEmailInput {
  to: string;
  name: string;
  /**
   * One-click link that takes the client to the "set your password" page.
   * Generated server-side via Supabase's admin.generateLink({ type: "recovery" }).
   */
  setPasswordUrl: string;
}

/**
 * Welcome email sent when a client account is created (from the coach's
 * "Add New Client" modal or the Stripe checkout webhook).
 *
 * Contains the login URL and a "Set your password" button that opens a fresh
 * Supabase recovery flow so the client picks their own password on first
 * login — we never send a password in plaintext.
 */
export async function sendClientWelcomeEmail({ to, name, setPasswordUrl }: WelcomeEmailInput) {
  const sb = client();
  if (!sb) {
    console.warn("[email] RESEND_API_KEY not set — skipping welcome email to", to);
    return { skipped: true as const };
  }
  const url = loginUrl();
  const brand = "DesiSquats";

  const subject = `Welcome to ${brand} — your login details`;

  const text = [
    `Hey ${name || "there"},`,
    ``,
    `Welcome to ${brand}. Your account is ready.`,
    ``,
    `Set your password and log in: ${setPasswordUrl}`,
    ``,
    `The link is single-use and expires in 24 hours. After you set your`,
    `password, log in at ${url} with the email ${to}.`,
    ``,
    `— Coach Praneeth`,
  ].join("\n");

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#fff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0a0a0a;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;">
        <tr><td>
          <p style="font-size:11px;font-weight:700;color:#f61;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 12px;">Welcome to ${brand}</p>
          <h1 style="font-size:22px;font-weight:800;color:#fff;line-height:1.25;margin:0 0 16px;">Your account is ready.</h1>
          <p style="font-size:14px;color:#a1a1aa;line-height:1.6;margin:0 0 24px;">
            Hey ${escapeHtml(name || "there")}, your ${brand} dashboard is all set up. Tap the button below to pick a password and log in.
          </p>

          <a href="${setPasswordUrl}" style="display:inline-block;background:linear-gradient(90deg,#f61,#e55a00);color:#fff;text-decoration:none;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;padding:14px 28px;border-radius:10px;">
            Set your password →
          </a>

          <p style="font-size:12px;color:#71717a;line-height:1.6;margin:24px 0 0;">
            The link is single-use and expires in 24 hours. Once you set a password, log in at <a href="${url}" style="color:#f61;">${url}</a> with <strong style="color:#a1a1aa;">${escapeHtml(to)}</strong>.
          </p>
          <p style="font-size:11px;color:#52525b;line-height:1.6;margin:12px 0 0;word-break:break-all;">
            Button not working? Paste this link into your browser: <a href="${setPasswordUrl}" style="color:#f61;">${setPasswordUrl}</a>
          </p>

          <p style="font-size:12px;color:#a1a1aa;line-height:1.6;margin:24px 0 0;">— Coach Praneeth</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const { error } = await sb.emails.send({
    from: fromAddress(),
    to,
    subject,
    text,
    html,
  });
  if (error) {
    console.error("[email] send failed", error);
    return { error: (error as unknown as { message?: string })?.message || "send failed" };
  }
  return { ok: true as const };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string
  ));
}
