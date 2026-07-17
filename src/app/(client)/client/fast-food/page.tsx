"use client";

/**
 * /client/fast-food
 *
 * Embeds Coach Praneeth's Fast Food guide PDF inline. Uses <object> with an
 * <iframe> fallback and a "Download" / "Open in new tab" affordance for
 * environments (some iOS Safari builds) where inline PDF rendering is
 * flaky.
 */
import { useState } from "react";
import { Download, ExternalLink, Pizza } from "lucide-react";

const PDF_URL = "/clients/desisquats/fast-food-guide.pdf";

export default function FastFoodPage() {
  const [failed, setFailed] = useState(false);

  return (
    <div className="min-h-[calc(100vh-56px)] pb-24">
      <div className="mb-4 flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center">
          <Pizza className="h-5 w-5 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-white">Fast Food Guide</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Coach Praneeth&apos;s picks for staying on track when you&apos;re eating out.
          </p>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 mb-4">
        <a
          href={PDF_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.06] transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open in new tab
        </a>
        <a
          href={PDF_URL}
          download="DesiSquats-Fast-Food-Guide.pdf"
          className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-xs font-medium text-gold hover:bg-gold/15 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Download PDF
        </a>
      </div>

      {/* PDF viewer — tall enough to give a comfortable read on phones */}
      <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-black">
        {failed ? (
          <div className="p-8 text-center">
            <p className="text-sm text-zinc-400">
              Your browser can&apos;t preview this PDF inline. Use the buttons
              above to open or download it.
            </p>
          </div>
        ) : (
          <object
            data={`${PDF_URL}#view=FitH`}
            type="application/pdf"
            className="w-full block bg-white"
            style={{ height: "calc(100vh - 220px)", minHeight: 480 }}
            onError={() => setFailed(true)}
          >
            {/* Fallback iframe for browsers that don't handle <object> well */}
            <iframe
              src={`${PDF_URL}#view=FitH`}
              title="Fast Food Guide"
              className="w-full block bg-white"
              style={{ height: "calc(100vh - 220px)", minHeight: 480 }}
              onError={() => setFailed(true)}
            />
          </object>
        )}
      </div>
    </div>
  );
}
