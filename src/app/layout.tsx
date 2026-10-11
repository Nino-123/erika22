import type { Metadata, Viewport } from "next";
import { Caveat, Cormorant_Garamond, Jost, Pinyon_Script } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

const hand = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

const script = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: site.meta.title,
  description: site.meta.description,
  // A private gift: keep it out of search engines.
  robots: { index: false, follow: false },
  openGraph: {
    title: site.meta.title,
    description: site.meta.description,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbe3e8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${hand.variable} ${script.variable} antialiased`}
    >
      <body>
        {children}
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
