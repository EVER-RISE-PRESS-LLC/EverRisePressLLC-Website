import type { Metadata } from "next";
import { Spectral, Karla } from "next/font/google";
import "./globals.css";

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
  appleWebApp: {
    title: "Ever Rise",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spectral.variable} ${karla.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
