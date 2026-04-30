import { ClientNavbar } from "@/components/client/navbar";
import { ClientGuard } from "@/components/auth-guard";

export const dynamic = "force-dynamic";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientGuard>
      <div className="min-h-screen bg-[#0a0a0a]">
        <ClientNavbar />
        <main className="mx-auto max-w-lg px-4 py-6 pb-24">{children}</main>
      </div>
    </ClientGuard>
  );
}
