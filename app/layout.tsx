import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import { th } from "@/lib/i18n/th";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: th.metadata.title,
  description: th.metadata.description,
  openGraph: {
    title: th.metadata.title,
    description: th.metadata.shortDescription,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: th.metadata.title,
    description: th.metadata.shortDescription,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${baloo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#fafafa] text-neutral-900 font-[var(--font-baloo),system-ui,sans-serif]">
        {children}
      </body>
    </html>
  );
}
