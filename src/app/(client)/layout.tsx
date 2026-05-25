"use client";

import { usePathname } from "next/navigation";
import { ClientNavbar } from "@/components/client/navbar";
import { ClientGuard } from "@/components/auth-guard";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGatePage = pathname.includes("/client/change-password") || pathname.includes("/client/onboarding");

  return (
    <ClientGuard>
      <div className="min-h-screen bg-[#0a0a0a]">
        {!isGatePage && <ClientNavbar />}
        <main className="mx-auto max-w-lg px-4 py-6 pb-24">{children}</main>
      </div>
    </ClientGuard>
  );
}
