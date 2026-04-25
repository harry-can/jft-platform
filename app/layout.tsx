import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JFT Practice Platform",
  description: "Practice, mock exam, and progress tracking platform for JFT Basic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}