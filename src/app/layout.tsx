import type { Metadata } from "next";
import { Spectral, Karla } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import PrivacyPreferences from "@/components/privacy/PrivacyPreferences";
import OptionalAnalytics from "@/components/privacy/OptionalAnalytics";
import PostHogProvider from "@/components/providers/PostHogProvider";
import MetaPixelProvider from "@/components/providers/MetaPixelProvider";
import { buildMetadata } from "@/lib/seo/metadata";
import { BlogAvailabilityProvider } from "@/components/blog/BlogAvailability";
import { getPublishedArticles } from "@/lib/blog/catalog";
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const publishedArticles = await getPublishedArticles();
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn("h-full", "antialiased", spectral.variable, karla.variable, "font-sans")}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <OptionalAnalytics />
        <PostHogProvider>
          <MetaPixelProvider><BlogAvailabilityProvider available={publishedArticles.length > 0}>{children}</BlogAvailabilityProvider></MetaPixelProvider>
        </PostHogProvider>
        <PrivacyPreferences />
      </body>
    </html>
  );
}
