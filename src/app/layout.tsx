import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-display",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Briefed — Creative Briefs Made Simple",
  description:
    "An interactive onboarding tool that translates vague client ideas into comprehensive, designer-ready creative briefs.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://agency-platform-nu.vercel.app"),
  openGraph: {
    title: "Briefed — Creative Briefs Made Simple",
    description:
      "Stop chasing clients for project details. Send a link, get a beautiful creative brief back.",
    siteName: "Briefed",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Briefed — Creative Briefs Made Simple",
    description:
      "Stop chasing clients for project details. Send a link, get a beautiful creative brief back.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sourceSerif.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
