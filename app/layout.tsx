import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
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
  title: "GeekCraft Clicker Maker",
  description:
    "Design your own customized clicker fidget toy — pick letters, colors, and a font, then save the preview and order from GeekCraft.",
  openGraph: {
    title: "GeekCraft Clicker Maker",
    description: "Design your own 3D-printed clicker fidget toy.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GeekCraft Clicker Maker",
    description: "Design your own 3D-printed clicker fidget toy.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${baloo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#fafafa] text-neutral-900 font-[var(--font-baloo),system-ui,sans-serif]">
        {children}
      </body>
    </html>
  );
}
