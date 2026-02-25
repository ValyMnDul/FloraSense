import type { Metadata } from "next";
import "./globals.css";
import {Inter } from 'next/font/google';

const inter = Inter({
  subsets: ["latin"],
  weight: ["300","400","500","600","700","800"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "FloraSense",
  description: "Real-time monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased ${inter.className}`}
      >
        {children}
      </body>
    </html>
  );
}
