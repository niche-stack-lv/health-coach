import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ThemeVars } from "@/components/theme-vars";
import siteConfig from "../../site.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const c = siteConfig;

export const metadata: Metadata = {
  title: c.seo.title,
  description: c.seo.description,
  openGraph: {
    title: c.seo.ogTitle,
    description: c.seo.ogDescription,
    images: [{ url: c.images.ogImage, width: 1200, height: 630, alt: `${c.coach.name} — ${c.brand.name}` }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: c.seo.ogTitle,
    description: c.seo.twitterDescription,
    images: [c.images.ogImage],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeVars />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
