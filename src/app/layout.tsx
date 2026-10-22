import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Spectral, Karla } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";
import PostHogProvider from "@/components/providers/PostHogProvider";
import MetaPixelProvider from "@/components/providers/MetaPixelProvider";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/ids";

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
  ...buildMetadata("home"),
  // A route supplies its own canonical; do not inherit the homepage URL.
  alternates: {},
  metadataBase: new URL(SITE_URL),
  appleWebApp: {
    title: "EverRise Press",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn("h-full", "antialiased", spectral.variable, karla.variable, "font-sans")}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_ID} />
        <PostHogProvider>
          <MetaPixelProvider>{children}</MetaPixelProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
