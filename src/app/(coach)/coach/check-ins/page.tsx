"use client";

import { useState, useEffect } from "react";
import { Camera, MessageSquare, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getCoachCheckIns, getCheckInPhotoUrls } from "@/lib/db";
import { getSupabase } from "@/lib/supabase";
import { formatDate, cn } from "@/lib/utils";

const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold/50";

export default function CheckInsPage() {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [photoUrls, setPhotoUrls] = useState<Record<string, string[]>>({});
  const [loadingPhotos, setLoadingPhotos] = useState<Record<string, boolean>>({});
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData() {
    if (!user) return;
    const data = await getCoachCheckIns(user.id);
    setCheckIns(data);
    setLoading(false);
  }

  async function loadPhotos(checkInId: string, paths: string[]) {
    if (photoUrls[checkInId] || loadingPhotos[checkInId]) return;
    setLoadingPhotos((p) => ({ ...p, [checkInId]: true }));
    const urls = await getCheckInPhotoUrls(paths);
    setPhotoUrls((p) => ({ ...p, [checkInId]: urls }));
    setLoadingPhotos((p) => ({ ...p, [checkInId]: false }));
  }

  async function submitFeedback(id: string) {
    const sb = getSupabase();
    await sb.from("check_ins").update({ coach_feedback: feedbackText, status: "reviewed" }).eq("id", id);
    setFeedbackId(null);
    setFeedbackText("");
    loadData();
  }

  async function markReviewed(id: string) {
    const sb = getSupabase();
    await sb.from("check_ins").update({ status: "reviewed" }).eq("id", id);
    loadData();
  }

  const pending = checkIns.filter((c) => c.status === "pending");
  const reviewed = checkIns.filter((c) => c.status === "reviewed");

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>;

  function PhotoGrid({ ci }: { ci: any }) {
    const paths = ci.photos || [];
    if (paths.length === 0) return null;
    const urls = photoUrls[ci.id];
    const isLoading = loadingPhotos[ci.id];

    return (
      <div className="mb-3">
        {!urls && !isLoading && (
          <button
            onClick={() => loadPhotos(ci.id, paths)}
            className="text-xs text-gold font-medium hover:text-gold-light transition-colors"
          >
            <Camera className="h-3.5 w-3.5 inline mr-1" />
            View {paths.length} photo{paths.length > 1 ? "s" : ""}
          </button>
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div className="h-4 w-4 rounded-full border-2 border-gold border-t-transparent animate-spin" />
            Loading photos...
          </div>
        )}
        {urls && urls.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {urls.map((url, i) => (
              <button key={i} onClick={() => setLightboxUrl(url)} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/[0.06] hover:border-gold/30 transition-colors">
                <img src={url} alt={`Progress photo ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
        {urls && urls.length === 0 && (
          <p className="text-xs text-zinc-600">Photos could not be loaded.</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6"><h1 className="text-xl lg:text-2xl font-bold text-white">Check-ins</h1><p className="text-zinc-500 mt-1 text-sm">{pending.length} pending review</p></div>

      {checkIns.length === 0 ? (
        <Card className="text-center py-12"><p className="text-zinc-500">No check-ins yet. Clients will submit them weekly.</p></Card>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gold uppercase tracking-wider mb-4">Pending ({pending.length})</h2>
              <div className="space-y-4">
                {pending.map((ci) => (
                  <Card key={ci.id} className="hover:border-gold/20 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-start gap-3">
                        <Avatar name={ci.client?.name || "?"} />
                        <div>
                          <p className="font-semibold text-white">{ci.client?.name}</p>
                          <p className="text-xs text-zinc-500">{formatDate(ci.date || ci.created_at)}</p>
                        </div>
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    {ci.notes && <p className="text-xs text-zinc-400 bg-white/[0.03] rounded-lg p-2 border border-white/[0.06] mb-3">&ldquo;{ci.notes}&rdquo;</p>}
                    <div className="flex items-center gap-3 mb-3">
                      {ci.weight && <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2"><p className="text-xs text-zinc-500">Weight</p><p className="text-sm font-semibold text-white">{ci.weight} kg</p></div>}
                      <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2"><p className="text-xs text-zinc-500">Photos</p><p className="text-sm font-semibold text-white">{(ci.photos || []).length}</p></div>
                    </div>
                    <PhotoGrid ci={ci} />
                    {feedbackId === ci.id ? (
                      <div className="space-y-2">
                        <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Write your feedback..." rows={3} className={cn(inputClass, "resize-none")} />
                        <div className="flex gap-2">
                          <Button variant="gold" size="sm" onClick={() => submitFeedback(ci.id)} disabled={!feedbackText}>Send Feedback</Button>
                          <Button variant="secondary" size="sm" onClick={() => setFeedbackId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="gold" size="sm" onClick={() => { setFeedbackId(ci.id); setFeedbackText(""); }}><MessageSquare className="h-3.5 w-3.5" /> Feedback</Button>
                        <Button variant="secondary" size="sm" onClick={() => markReviewed(ci.id)}>Mark Reviewed</Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
          {reviewed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Reviewed ({reviewed.length})</h2>
              <div className="space-y-3">
                {reviewed.map((ci) => (
                  <Card key={ci.id} className="opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar name={ci.client?.name || "?"} />
                        <div><p className="font-medium text-white">{ci.client?.name}</p><p className="text-xs text-zinc-500">{formatDate(ci.date || ci.created_at)}</p></div>
                      </div>
                      <Badge variant="success">Reviewed</Badge>
                    </div>
                    {ci.coach_feedback && <div className="mt-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3"><p className="text-xs text-emerald-400 font-medium mb-1">Your feedback</p><p className="text-sm text-emerald-300/80">{ci.coach_feedback}</p></div>}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Photo lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setLightboxUrl(null)}>
          <button onClick={() => setLightboxUrl(null)} className="absolute top-4 right-4 p-2 rounded-xl bg-white/[0.1] hover:bg-white/[0.2] transition-colors z-10">
            <X className="h-5 w-5 text-white" />
          </button>
          <img src={lightboxUrl} alt="Progress photo" className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
