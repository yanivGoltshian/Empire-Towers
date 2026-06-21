import type { Metadata, Viewport } from "next";
import { Heebo, Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import JsonLd from "@/components/JsonLd";
import { organizationLd, websiteLd } from "@/lib/structured-data";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  weight: ["300", "400", "500", "700", "800", "900"],
});

const frank = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  variable: "--font-frank",
  weight: ["500", "700", "800", "900"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yanivgoltshian.github.io";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}${BASE_PATH}/`),
  title: {
    default: `${site.name} – ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "מגדלי האימפריה",
    "משרדים להשכרה יבנה",
    "משרד פרטי להשכרה",
    "השכרת משרדים יבנה",
    "חללי עבודה יבנה",
    "משרד במחיר פיקס",
    "מתחם עסקים יבנה",
    "חדר ישיבות להשכרה",
    "משרדים ליד תחנת הרכבת יבנה",
    "נדל״ן מסחרי יבנה",
  ],
  openGraph: {
    title: `${site.name} – ${site.tagline}`,
    description: site.description,
    type: "website",
    locale: "he_IL",
    siteName: site.name,
    url: `${SITE_URL}${BASE_PATH}/`,
    images: [
      {
        url: `${SITE_URL}${BASE_PATH}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${site.name} – ${site.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} – ${site.tagline}`,
    description: site.description,
    images: [`${SITE_URL}${BASE_PATH}/og-image.jpg`],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#16314f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.variable} ${frank.variable} antialiased`}>
        <JsonLd data={[organizationLd(), websiteLd()]} />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppFab />
      </body>
    </html>
  );
}
