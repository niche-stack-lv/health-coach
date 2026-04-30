# WhatsApp Integration

## What it does here
WhatsApp is used as the primary communication channel between the coach and prospective clients. The app generates pre-formatted WhatsApp messages and opens them via `wa.me` deep links. There is no WhatsApp API integration — it's purely URL-based.

## Where the client/wrapper lives
No wrapper. Direct `window.open()` calls in:
- `src/app/pricing/page.tsx` — sends order details after payment confirmation
- `src/app/enquiry/page.tsx` — sends enquiry form data
- `src/app/book-call/page.tsx` — sends call booking details

## Common operations

### Send order confirmation (pricing page)
```tsx
const msg = [
  `🏋️ *New FitCoach Order*`,
  `*Client:* ${name}`,
  `*Phone:* ${phone}`,
  `*Program:* ${program}`,
  `*Plan:* ${planLabel}`,
  `*Amount:* ₹${price}`,
  // ... more fields
].filter(Boolean).join("\n");
window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
```

### Send enquiry (enquiry page)
Same pattern — builds a multi-line message with form data and opens WhatsApp.

### Send call booking (book-call page)
Same pattern — simpler message with name, phone, email, and service type.

## Error handling
None. `window.open()` can be blocked by popup blockers. No fallback is provided.

## Known quirks
- The WhatsApp number is hardcoded as `"917351111165"` (India country code + number) in each page separately — not centralized.
- Messages use WhatsApp markdown (`*bold*`) for formatting.
- The `encodeURIComponent` handles special characters but very long messages may be truncated on some devices.

## Env vars needed
None — the WhatsApp number is hardcoded.
