import { jsPDF } from "jspdf";
import { config } from "./config";

// Brand colors from config
const gold: [number, number, number] = [...config.colors.primaryRgb];
const goldLight: [number, number, number] = [...config.colors.primaryLightRgb];
const dark: [number, number, number] = [10, 10, 10];
const darkCard: [number, number, number] = [22, 22, 22];
const white: [number, number, number] = [255, 255, 255];
const zinc400: [number, number, number] = [161, 161, 170];
const zinc600: [number, number, number] = [82, 82, 91];

interface OrderDetails {
  name: string;
  phone: string;
  email: string;
  program?: string;
  duration?: string;
  planLabel: string;
  price: string;
  type: "plan" | "call";
}

function drawGoldLine(doc: jsPDF, x: number, y: number, width: number) {
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.line(x, y, x + width, y);
}

function sectionTitle(doc: jsPDF, text: string, y: number): number {
  doc.setFillColor(...gold);
  doc.rect(15, y, 3, 6, "F");
  doc.setTextColor(...gold);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(text, 21, y + 5);
  return y + 12;
}

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateConfirmationPDF(order: OrderDetails) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const ref = `FC-${Date.now().toString(36).toUpperCase()}`;
  const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  // ─────────────────────────────────────────────
  // PAGE 1
  // ─────────────────────────────────────────────

  // Full black background
  doc.setFillColor(...dark);
  doc.rect(0, 0, W, 297, "F");

  // Gold top accent bar
  doc.setFillColor(...gold);
  doc.rect(0, 0, W, 2, "F");

  // Gold side accent
  doc.setFillColor(...gold);
  doc.rect(0, 0, 1.5, 297, "F");

  // Header area
  doc.setFillColor(...darkCard);
  doc.rect(0, 2, W, 55, "F");

  // Brand name
  doc.setTextColor(...gold);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(config.brand.name.toUpperCase(), 20, 22);

  // Tagline
  doc.setTextColor(...zinc400);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`BY ${config.coach.credentials}`, 20, 29);

  // Gold divider
  doc.setFillColor(...gold);
  doc.rect(20, 32, 40, 0.5, "F");

  // Booking confirmed badge
  doc.setFillColor(...gold);
  doc.roundedRect(20, 37, 55, 10, 2, 2, "F");
  doc.setTextColor(...dark);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("✓  BOOKING CONFIRMED", 24, 43.5);

  // Ref & date top right
  doc.setTextColor(...zinc600);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Ref: ${ref}`, W - 15, 20, { align: "right" });
  doc.text(date, W - 15, 27, { align: "right" });

  // Try to load coach photo
  const photoBase64 = await loadImageAsBase64(config.images.coachPhoto);
  if (photoBase64) {
    // Circular-ish photo on right side of header
    doc.addImage(photoBase64, "JPEG", W - 52, 4, 48, 50);
    // Gold border around photo
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.8);
    doc.rect(W - 52, 4, 48, 50);
  }

  let y = 68;

  // ── Welcome message ──
  doc.setTextColor(...white);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`Welcome, ${order.name}!`, 20, y);
  y += 8;
  doc.setTextColor(...zinc400);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const welcomeText = order.type === "call"
    ? `Your consultation with Coach ${config.coach.firstName} has been booked. Get ready for a conversation that could change your life.`
    : "Your transformation journey begins now. You have taken the most important step — the decision to change.";
  const welcomeLines = doc.splitTextToSize(welcomeText, W - 40);
  doc.text(welcomeLines, 20, y);
  y += welcomeLines.length * 5 + 8;

  drawGoldLine(doc, 20, y, W - 40);
  y += 8;

  // ── Order Details ──
  y = sectionTitle(doc, "ORDER DETAILS", y);

  doc.setFillColor(...darkCard);
  doc.roundedRect(20, y, W - 40, 38, 3, 3, "F");
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, y, W - 40, 38, 3, 3, "S");

  doc.setTextColor(...zinc400);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  let iy = y + 8;
  if (order.type === "call") {
    doc.text("SERVICE", 28, iy);
    doc.setTextColor(...white);
    doc.setFont("helvetica", "bold");
    doc.text("1-on-1 Telephonic Consultation (15 min)", 28, iy + 5);
  } else {
    doc.text("PROGRAM", 28, iy);
    doc.setTextColor(...white);
    doc.setFont("helvetica", "bold");
    doc.text(order.program || "—", 28, iy + 5);

    doc.setTextColor(...zinc400);
    doc.setFont("helvetica", "normal");
    doc.text("DURATION", 90, iy);
    doc.setTextColor(...white);
    doc.setFont("helvetica", "bold");
    doc.text(`${order.duration} Weeks`, 90, iy + 5);

    doc.setTextColor(...zinc400);
    doc.setFont("helvetica", "normal");
    doc.text("PLAN", 140, iy);
    doc.setTextColor(...white);
    doc.setFont("helvetica", "bold");
    const planLines = doc.splitTextToSize(order.planLabel, 45);
    doc.text(planLines, 140, iy + 5);
  }

  iy += 18;
  doc.setFillColor(...gold);
  doc.roundedRect(28, iy, W - 56, 10, 2, 2, "F");
  doc.setTextColor(...dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`AMOUNT PAID: ${order.price}`, (W) / 2, iy + 7, { align: "center" });

  y += 46;

  // ── Client Details ──
  y = sectionTitle(doc, "YOUR DETAILS", y);

  doc.setFillColor(...darkCard);
  doc.roundedRect(20, y, W - 40, 26, 3, 3, "F");

  const cols = [
    { label: "NAME", value: order.name, x: 28 },
    { label: "PHONE", value: order.phone, x: 85 },
    { label: "EMAIL", value: order.email, x: 142 },
  ];
  cols.forEach(({ label, value, x }) => {
    doc.setTextColor(...zinc400);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(label, x, y + 8);
    doc.setTextColor(...white);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    const v = doc.splitTextToSize(value || "—", 55);
    doc.text(v[0], x, y + 15);
  });

  y += 34;

  // ── What Happens Next ──
  y = sectionTitle(doc, "WHAT HAPPENS NEXT", y);

  const steps = order.type === "call"
    ? [
        { n: "1", t: "Payment Verified", d: `Coach ${config.coach.firstName} will verify your payment within 24 hours.` },
        { n: "2", t: "Call Scheduled", d: "He will WhatsApp you to pick a time that works for you." },
        { n: "3", t: "Your Consultation", d: "Discuss your goals, training history, diet, and lifestyle." },
        { n: "4", t: "Your Roadmap", d: `${config.coach.firstName} will recommend the exact plan your body needs.` },
      ]
    : [
        { n: "1", t: "Payment Verified", d: `Coach ${config.coach.firstName} will verify your payment within 24 hours.` },
        { n: "2", t: "WhatsApp Confirmation", d: "You will receive a message confirming your account activation." },
        { n: "3", t: "Sign Up on Portal", d: `Visit ${config.contact.websiteUrl}/signup and create your account using the email you provided.` },
        { n: "4", t: "Plan Built For You", d: "Your personalized plan will be ready within 48-72 hours." },
        { n: "5", t: "Access Your Portal", d: `Log in at ${config.contact.websiteUrl} to view your complete plan.` },
      ];

  const stepCount = steps.length;
  const stepCardW = (W - 40 - (stepCount - 1) * 3) / stepCount;
  steps.forEach((step, i) => {
    const sx = 20 + i * (stepCardW + 3);
    doc.setFillColor(...darkCard);
    doc.roundedRect(sx, y, stepCardW, 28, 2, 2, "F");
    doc.setFillColor(...gold);
    doc.circle(sx + 5, y + 7, 3.5, "F");
    doc.setTextColor(...dark);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(step.n, sx + 5, y + 9.2, { align: "center" });
    doc.setTextColor(...gold);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    const tl = doc.splitTextToSize(step.t, stepCardW - 6);
    doc.text(tl, sx + 2, y + 16);
    doc.setTextColor(...zinc400);
    doc.setFontSize(5.8);
    doc.setFont("helvetica", "normal");
    const dl = doc.splitTextToSize(step.d, stepCardW - 6);
    doc.text(dl, sx + 2, y + 16 + tl.length * 5);
  });

  y += 36;

  // ── Footer page 1 ──
  doc.setFillColor(...darkCard);
  doc.rect(0, 280, W, 17, "F");
  doc.setFillColor(...gold);
  doc.rect(0, 280, W, 0.5, "F");
  doc.setTextColor(...zinc400);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`${config.contact.websiteUrl}  ·  ${config.contact.instagramHandle}  ·  ${config.contact.youtubeHandle}`, W / 2, 290, { align: "center" });
  doc.setTextColor(...gold);
  doc.text("Page 1 of 2", W - 20, 290, { align: "right" });

  // ─────────────────────────────────────────────
  // PAGE 2 — Coach intro + Motivation
  // ─────────────────────────────────────────────
  doc.addPage();

  // Background
  doc.setFillColor(...dark);
  doc.rect(0, 0, W, 297, "F");
  doc.setFillColor(...gold);
  doc.rect(0, 0, W, 2, "F");
  doc.setFillColor(...gold);
  doc.rect(0, 0, 1.5, 297, "F");

  y = 15;

  // ── Meet Your Coach ──
  doc.setFillColor(...darkCard);
  doc.rect(0, y - 5, W, 65, "F");

  if (photoBase64) {
    doc.addImage(photoBase64, "JPEG", 15, y, 38, 50);
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.8);
    doc.rect(15, y, 38, 50);
  }

  const cx = 60;
  doc.setTextColor(...gold);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("YOUR COACH", cx, y + 6);
  doc.setTextColor(...white);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(config.coach.name.toUpperCase(), cx, y + 15);
  doc.setFillColor(...gold);
  doc.rect(cx, y + 17, 50, 0.5, "F");

  doc.setTextColor(...gold);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(config.coach.credentials, cx, y + 24);

  const bioLines = config.coach.bioBullets;
  bioLines.forEach((line, i) => {
    doc.setFillColor(...gold);
    doc.circle(cx + 1.5, y + 31 + i * 7, 1, "F");
    doc.setTextColor(...zinc400);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text(line, cx + 5, y + 32.5 + i * 7);
  });

  y += 68;

  // ── Motivational Section ──
  doc.setTextColor(...gold);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(`A MESSAGE FROM COACH ${config.coach.firstName.toUpperCase()}`, 20, y);
  y += 4;
  drawGoldLine(doc, 20, y, W - 40);
  y += 8;

  // Big quote
  doc.setFillColor(...darkCard);
  doc.roundedRect(15, y, W - 30, 28, 3, 3, "F");
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, y, W - 30, 28, 3, 3, "S");
  doc.setFillColor(...gold);
  doc.rect(15, y, 3, 28, "F");

  doc.setTextColor(...gold);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text('"', 22, y + 10);
  doc.setTextColor(...white);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  const q1 = doc.splitTextToSize(config.coach.quote, W - 55);
  doc.text(q1, 30, y + 10);
  doc.setTextColor(...zinc400);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`— Coach ${config.coach.name}`, W - 20, y + 23, { align: "right" });
  y += 36;

  const motivations = config.coach.motivations.map((m, i) => ({
    num: String(i + 1).padStart(2, "0"),
    title: m.title,
    body: m.body,
  }));

  const cardW = (W - 45) / 2;
  motivations.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const mx = 15 + col * (cardW + 15);
    const my = y + row * 38;

    doc.setFillColor(...darkCard);
    doc.roundedRect(mx, my, cardW, 34, 2, 2, "F");

    // Gold top border
    doc.setFillColor(...gold);
    doc.roundedRect(mx, my, cardW, 1.5, 1, 1, "F");

    // Number badge
    doc.setFillColor(...gold);
    doc.circle(mx + 8, my + 10, 5, "F");
    doc.setTextColor(...dark);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(m.num, mx + 8, my + 12, { align: "center" });

    doc.setTextColor(...white);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text(m.title, mx + 16, my + 10);

    doc.setTextColor(...zinc400);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    const bodyLines = doc.splitTextToSize(m.body, cardW - 20);
    doc.text(bodyLines, mx + 4, my + 17);
  });

  y += 3 * 38 + 5;

  // ── Final CTA ──
  doc.setFillColor(...gold);
  doc.roundedRect(15, y, W - 30, 18, 3, 3, "F");
  doc.setTextColor(...dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("YOUR TRANSFORMATION STARTS NOW. LET'S GO!", W / 2, y + 7, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Log in at ${config.contact.websiteUrl}  ·  WhatsApp: ${config.contact.whatsappDisplay}`, W / 2, y + 13, { align: "center" });

  // ── Footer page 2 ──
  doc.setFillColor(...darkCard);
  doc.rect(0, 280, W, 17, "F");
  doc.setFillColor(...gold);
  doc.rect(0, 280, W, 0.5, "F");
  doc.setTextColor(...zinc400);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`${config.contact.websiteUrl}  ·  ${config.contact.instagramHandle}  ·  ${config.contact.youtubeHandle}`, W / 2, 290, { align: "center" });
  doc.setTextColor(...gold);
  doc.text("Page 2 of 2", W - 20, 290, { align: "right" });

  const filename = order.type === "call"
    ? `${config.brand.name}-Call-Booking-${order.name.replace(/\s+/g, "-")}.pdf`
    : `${config.brand.name}-Confirmation-${order.name.replace(/\s+/g, "-")}.pdf`;
  doc.save(filename);
}
