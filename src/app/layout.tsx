import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio - Web Designer & Developer",
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
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
