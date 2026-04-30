import { CoachSidebar } from "@/components/coach/sidebar";
import { CoachGuard } from "@/components/auth-guard";

export const dynamic = "force-dynamic";

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <CoachGuard>
      <div className="min-h-screen bg-[#0a0a0a]">
        <CoachSidebar />
        <main className="lg:pl-64">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </CoachGuard>
  );
}
