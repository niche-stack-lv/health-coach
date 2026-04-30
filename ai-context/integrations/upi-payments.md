# UPI Payments

## What it does here
The app uses UPI (Unified Payments Interface) for collecting payments from Indian clients. There is no payment gateway — clients scan a QR code or copy the UPI ID, pay manually via their banking app, then upload a screenshot as proof. The coach verifies payment manually via WhatsApp.

## Where the client/wrapper lives
No wrapper. Payment UI is in:
- `src/app/pricing/page.tsx` — main checkout flow with QR code
- `src/app/book-call/page.tsx` — ₹499 call booking with QR code

## Common operations

### Display QR code
```tsx
const UPI_ID = "9560133404@pthfc";
<Image src="/upi-qr.jpg" alt="UPI QR" width={180} height={180} />
```

### Copy UPI ID
```tsx
const copyUPI = () => {
  navigator.clipboard.writeText(UPI_ID);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};
```

### Upload payment screenshot
```tsx
<input type="file" accept="image/*" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} />
```
The screenshot is NOT uploaded to Supabase storage — it's only held in local state. The confirmation is sent via WhatsApp message.

## Error handling
- `navigator.clipboard.writeText` can fail in non-HTTPS contexts — no error handling.
- Screenshot upload is client-side only — the file is never persisted.

## Known quirks
- The QR code image (`/upi-qr.jpg`) is a static file in `/public`. If the UPI ID changes, both the image and the `UPI_ID` constant need updating.
- The UPI ID `"9560133404@pthfc"` is hardcoded in both `pricing/page.tsx` and `book-call/page.tsx`.
- Payment verification is entirely manual — the coach checks WhatsApp for the screenshot and order details.
- There's no payment status tracking in the database. The `leads` table records the order but has no `payment_verified` field.

## Env vars needed
None — UPI ID is hardcoded.
