import type { Metadata } from "next";
import "@/styles/globals.css";
import { Navigation } from "@/components/Navigation";

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
      <body>
        <div id="root">
          <Navigation />
          {children}
        </div>
      </body>
    </html>
  );
}
