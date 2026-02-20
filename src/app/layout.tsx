import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOAir — Convert MTN & Airtel Money Statements to CSV",
  description: "Instantly convert MTN Mobile Money and Airtel Money PDF statements into clean, Excel-ready CSV files. Free, secure, built for Africa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
