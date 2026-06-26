"use client";

import { X, ExternalLink } from "lucide-react";
import { youtubeEmbedUrl, youtubeWatchUrl } from "@/lib/youtube";

interface ExerciseVideoSheetProps {
  /** Exercise display name. */
  name: string;
  emoji?: string;
  equipment?: string | null;
  /** Parsed YouTube video id. */
  videoId: string;
  onClose: () => void;
}

/**
 * Bottom sheet that embeds a YouTube demo for an exercise.
 * Used by the coach Exercises directory and the client workout view.
 */
export function ExerciseVideoSheet({ name, emoji, equipment, videoId, onClose }: ExerciseVideoSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-[#1a1a1a] rounded-t-3xl border-t border-white/[0.08] safe-area-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-zinc-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Player */}
        <div className="w-full aspect-video overflow-hidden rounded-t-3xl bg-black">
          <iframe
            src={youtubeEmbedUrl(videoId)}
            title={name}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            {emoji && <span className="text-2xl">{emoji}</span>}
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white truncate">{name}</h2>
              {equipment && <p className="text-xs text-zinc-500">{equipment}</p>}
            </div>
          </div>

          <a
            href={youtubeWatchUrl(videoId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gold"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open on YouTube
          </a>
        </div>
      </div>
    </div>
  );
}
