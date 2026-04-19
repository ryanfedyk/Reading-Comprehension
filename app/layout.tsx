import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reading Adventure — AI Stories for Kids",
  description: "Personalized AI-generated stories, comprehension questions, and games.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg relative">{children}</body>
    </html>
  );
}
