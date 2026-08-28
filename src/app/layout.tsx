import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Spectral, Karla, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";
import PostHogProvider from "@/components/providers/PostHogProvider";
import MetaPixelProvider from "@/components/providers/MetaPixelProvider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "EverRise Press | Your Financial Heart Attack Is Already in Progress",
  description: "You're not losing money. You're practicing poverty until you're an expert. Independent publishing that diagnoses the patterns keeping you broke.",
  openGraph: {
    title: "EverRise Press",
    description: "You're not losing money. You're practicing poverty until you're an expert.",
    images: [
      {
        url: `${env.NEXT_PUBLIC_SITE_URL}/images/og/everrise-default.png`,
        width: 1200,
        height: 630,
        alt: "EverRise Press",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EverRise Press",
    description: "You're not losing money. You're practicing poverty until you're an expert.",
    images: [`${env.NEXT_PUBLIC_SITE_URL}/images/og/everrise-default.png`],
  },
  appleWebApp: {
    title: "Ever Rise",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn("h-full", "antialiased", spectral.variable, karla.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <link rel="preconnect" href="https://us-assets.i.posthog.com" />
        <link rel="preconnect" href="https://us.i.posthog.com" />
        <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_ID} />
        <PostHogProvider>
          <MetaPixelProvider>{children}</MetaPixelProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
