import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Intervu AI — AI-Powered Interview Practice",
  description:
    "Practice mock interviews, get AI feedback, and track your progress with Intervu AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}