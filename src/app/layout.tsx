import type { Metadata } from "next";
import localFont from "next/font/local";
import { GoogleAnalytics } from "@next/third-parties/google";
import "@/styles/globals.css";
import { Navigation } from "@/components/Navigation";

// Konfiguracja fontów
const pixeboy = localFont({
  src: "./fonts/Pixeboy-z8XGD.ttf",
  variable: "--font-pixeboy",
  weight: "100 900",
});

const thuast = localFont({
  src: "./fonts/Thuast.otf",
  variable: "--font-thuast",
  weight: "100 900",
});

const c64 = localFont({
  src: "./fonts/Commodore-64-v6.3.ttf",
  variable: "--font-c64",
  weight: "400",
});

// Metadane SEO
export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio-new-beta-lime.vercel.app"),
  title: {
    template: "%s | Silesia Runner Portfolio",
    default: "Silesia Runner | Full Stack Developer",
  },
  description:
    "Portfolio Full Stack Developera ze Śląska. Nowoczesne technologie webowe (Next.js, React, TypeScript) i interaktywna gra w stylu retro.",
  openGraph: {
    title: "Silesia Runner | Full Stack Developer",
    description:
      "Portfolio Full Stack Developera ze Śląska. Nowoczesne technologie webowe (Next.js, React, TypeScript) i interaktywna gra w stylu retro.",
    url: "https://portfolio-new-beta-lime.vercel.app",
    siteName: "Silesia Runner Portfolio",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "Full Stack Developer",
    "Programista stron www",
    "Tworzenie stron internetowych",
    "Aplikacje internetowe Śląsk",
    "Next.js Developer Polska",
    "React Developer",
    "Gry przeglądarkowe",
    "Web Development Bytom",
    "Nowoczesne strony www",
    "TypeScript",
    "Portfolio Programisty",
    "Silesia Runner",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Dane strukturalne (Schema.org) dla Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: "Patryk Łowigus",
      jobTitle: "Full Stack Developer",
      url: "https://portfolio-new-beta-lime.vercel.app",
      sameAs: [
        "https://github.com/plowigus",
        "https://linkedin.com/in/patryk-lowigus",
      ],
      address: {
        "@type": "PostalAddress",
        addressRegion: "Śląsk",
        addressCountry: "PL",
      },
      knowsAbout: [
        "Next.js",
        "React",
        "TypeScript",
        "Game Development",
      ],
    },
  };

  return (
    <html lang="en">
      <body
        className={`${pixeboy.variable} ${thuast.variable} ${c64.variable} antialiased font-sans`}
      >
        {/* Dane strukturalne JSON-LD wstrzykiwane jako czysty HTML */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div id="root">
          <Navigation />
          {children}
        </div>

        <GoogleAnalytics gaId="G-DZRNZ64WYQ" />
      </body>
    </html>
  );
}