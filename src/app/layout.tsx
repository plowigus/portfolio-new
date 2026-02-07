import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { Navigation } from "@/components/Navigation";

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

export const metadata: Metadata = {
  title: "Patryk Łowigus - Web Designer & Developer",
  description:
    "A bespoke web designer on a mission to elevate value driven brands. Creating elegant visual experiences with meticulous attention to detail.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${pixeboy.variable} ${thuast.variable} antialiased font-sans`}>
        <div id="root">
          <Navigation />
          {children}
        </div>
      </body>
    </html>
  );
}
