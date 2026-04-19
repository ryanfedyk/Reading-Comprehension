import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reading Adventure — AI Story & Game Maker for Kids",
  description:
    "Create personalized reading comprehension stories, questions, and games for children using AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        {children}
      </body>
    </html>
  );
}
