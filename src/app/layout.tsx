import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    template: "%s | AutoService Pro",
    default:  "AutoService Pro",
  },
  description: "Tu taller de confianza, siempre cerca",
  manifest:    "/icons/manifest.json",
};

export const viewport: Viewport = {
  themeColor:   "#ffffff",
  width:        "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className={inter.variable} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}