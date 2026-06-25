import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://intervu-ai-weld.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Intervu AI — AI-Powered Interview Practice Platform",
    template: "%s — Intervu AI",
  },
  description:
    "Practice mock interviews with AI. Get instant feedback, analyze your resume, solve coding problems, and track your progress. Free for placement season.",
  keywords: [
    "mock interview",
    "interview practice",
    "AI interview",
    "placement preparation",
    "coding interview",
    "resume analyzer",
    "interview feedback",
    "fresher interview",
    "software engineer interview",
  ],
  authors: [{ name: "Intervu AI" }],
  creator: "Intervu AI",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Intervu AI",
    title: "Intervu AI — AI-Powered Interview Practice Platform",
    description:
      "Practice mock interviews until you stop being nervous. AI feedback, resume analysis, coding practice — all free.",
    images: [
      {
        url: `/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Intervu AI — AI-Powered Interview Practice Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Intervu AI — AI-Powered Interview Practice Platform",
    description:
      "Practice mock interviews until you stop being nervous. Free AI feedback for placement season.",
    images: [`/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}