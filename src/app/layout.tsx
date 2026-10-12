import type { Metadata, Viewport } from "next";
import { Barlow, Caveat, Instrument_Serif } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const serif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const hand = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
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
  themeColor: "#060406",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${hand.variable} antialiased`}
    >
      <body>
        {children}
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
