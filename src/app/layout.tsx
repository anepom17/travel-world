import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Travel World — Дневник путешествий",
  description:
    "Персональный дневник путешествий с интерактивной картой мира, фотоальбомами и ИИ-портретом путешественника.",
  manifest: "/manifest.json",
  themeColor: "#0D9488",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Travel World",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors closeButton position="top-right" />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
