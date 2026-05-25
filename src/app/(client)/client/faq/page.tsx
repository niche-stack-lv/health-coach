"use client";

import { useState, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Video } from "lucide-react";
import { useIsDemo } from "@/lib/use-demo";

export default function FAQPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
      <FAQPageInner />
    </Suspense>
  );
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  videoId?: string; // Google Drive video ID
}

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  driveId: string; // Google Drive file ID
  thumbnail?: string;
}

const videoTutorials: VideoTutorial[] = [
  {
    id: "v1",
    title: "How Fat Loss Actually Works",
    description: "Understanding the science behind fat loss and weight management",
    driveId: "1d3kePi7d0CaLPl4rOd3jPLoJnVlCKw_4",
  },
  {
    id: "v2",
    title: "Can I Have a Cheat Meal?",
    description: "Learn how to incorporate cheat meals without derailing progress",
    driveId: "1eWrU34msBby2zUoQxi3-06Ql4Es8H7dp",
  },
  {
    id: "v3",
    title: "How Many Calories Should I Eat?",
    description: "Understanding your calorie needs for fat loss",
    driveId: "1PeYqkaygh0sgPILPGC96GTN_Q5dBYwGs",
  },
  {
    id: "v4",
    title: "Importance of Protein and Fiber in Every Meal",
    description: "Why protein and fiber are essential for fat loss success",
    driveId: "1MuVajHlCe3RmEXjz8vDiQp7SJaBzRDkg",
  },
  {
    id: "v5",
    title: "Mistakes Using Calorie Tracking Apps",
    description: "Common errors when tracking calories and how to avoid them",
    driveId: "1psThytoCTxv_tdSFhSUsOyzPdiYHlH4Y",
  },
  {
    id: "v6",
    title: "Alcohol During Diet",
    description: "How alcohol affects your diet and tips for managing it",
    driveId: "1bgDGiPo38Uqu85K7GTzTtSH8QHiUbnjB",
  },
  {
    id: "v7",
    title: "My Weight Went Up Without Any Cheat Meal",
    description: "Understanding normal weight fluctuations and what causes them",
    driveId: "1usPWpmGX_NlbO1_UceT2KdCjIFRfooP6",
  },
  {
    id: "v8",
    title: "How to Recover After a Cheat Meal or Meals",
    description: "Getting back on track after indulging",
    driveId: "1C4HDm5w00bNFRXqzln_88FNFKJ6W1tTY",
  },
  {
    id: "v9",
    title: "Vacation Tips",
    description: "How to maintain your progress while traveling",
    driveId: "1gfCLMg2FFsQ9PEdm-aleRa80kYHoxjAg",
  },
  {
    id: "v10",
    title: "India Trip Tips",
    description: "Staying on track during trips to India",
    driveId: "15LE-unBE__AiuWID1B6l7t-J29r9qcqd",
  },
  {
    id: "v11",
    title: "Avoid Processed Foods / Gut Bacteria",
    description: "Why processed foods affect your gut health and progress",
    driveId: "1gnCLLQpR57utA6MQseWrcVGf8et6Hf5f",
  },
  {
    id: "v12",
    title: "How to Rebound After a Bad Week",
    description: "Getting back on track after a challenging week",
    driveId: "1gLcD2fBniunK-Kblj81IcbpbTRuVe2Ul",
  },
  {
    id: "v13",
    title: "My Weight Stalled After Week 1",
    description: "Understanding why weight loss plateaus happen early",
    driveId: "1qBHMJy2Wj5XhGdyuW_MQ2HCfCGu1X4T0",
  },
  {
    id: "v14",
    title: "Constipation After Starting the Diet",
    description: "How to deal with digestive issues when starting a new diet",
    driveId: "1kaiOARr8wRLQYg73DduM-RrnzgeRvg7c",
  },
  {
    id: "v15",
    title: "Is My Protein Snack Good?",
    description: "Evaluating protein snacks and making smart choices",
    driveId: "1lMOWgqSMlaPMP5dNy3Adt6a2oUDhGKon",
  },
  {
    id: "v16",
    title: "Fast Food Options",
    description: "How to make better choices at fast food restaurants",
    driveId: "19K6CcxxScGgJh0S1QZURg_0h7Ld0u9FP",
  },
  {
    id: "v17",
    title: "Ordering at Indian Restaurant",
    description: "Smart choices when dining at Indian restaurants",
    driveId: "1Y0whoMKqP8y-xRQqTN1LSFjqfk6ADDiL",
  },
  {
    id: "v18",
    title: "How to Get Rid of Food Cravings",
    description: "Strategies to manage and overcome food cravings",
    driveId: "1mxTlP0J8xTbALpvUUTsfTh1Jymrv3Vlk",
  },
  {
    id: "v19",
    title: "How to Manage Stress Eating",
    description: "Understanding and controlling emotional eating",
    driveId: "1fGY3JJluUisHl2WEZD-r3KFDgA_L3bSs",
  },
  {
    id: "v20",
    title: "Weight Fluctuations During Cycle/Monthly (Females)",
    description: "Understanding hormonal weight changes during menstrual cycle",
    driveId: "1v4GWYunFIqKcmWKAjOM2ZMKVY39mGBBR",
  },
  {
    id: "v21",
    title: "Managing Diet Through Sickness",
    description: "How to maintain your diet when you're not feeling well",
    driveId: "1J4ydo5PAcciHhgKdWLDzVWSba77KxTmE",
  },
];

// No text FAQs - only video tutorials for now
const faqData: FAQItem[] = [];

const categories = ["All"];

function FAQPageInner() {
  const isDemo = useIsDemo();

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Video Tutorials</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Watch helpful guides about diet, nutrition, and fat loss</p>
      </div>

      {/* Video Tutorials */}
      <div className="space-y-3">
        {videoTutorials.length === 0 ? (
          <Card className="p-8 text-center">
            <Video className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">Video Tutorials Coming Soon</h3>
            <p className="text-xs text-zinc-500">
              We're preparing helpful video guides to help you get the most out of the platform.
            </p>
          </Card>
        ) : (
          videoTutorials.map((video) => (
            <Card key={video.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center ring-1 ring-gold/20 flex-shrink-0">
                    <Video className="h-5 w-5 text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white">{video.title}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{video.description}</p>
                  </div>
                </div>
                {/* Video Embed - Google Drive */}
                <div className="relative w-full rounded-lg overflow-hidden bg-black/20" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={`https://drive.google.com/file/d/${video.driveId}/preview`}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="autoplay"
                    allowFullScreen
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
