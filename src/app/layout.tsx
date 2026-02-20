import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOAir — Convert MTN & Airtel Money Statements to CSV",
  description: "Instantly convert MTN Mobile Money and Airtel Money PDF statements into clean, Excel-ready CSV files. Free, secure, built for Africa.",
};

// Inlined script runs before first paint to apply the saved theme class,
// preventing a flash of the wrong mode on hard reload.
const themeScript = `(function(){try{var s=localStorage.getItem('theme'),p=window.matchMedia('(prefers-color-scheme:dark)').matches;if(s==='dark'||(s===null&&p))document.documentElement.classList.add('dark')}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      {/* suppressHydrationWarning prevents React from complaining about the
          class attribute mismatch caused by the theme script above. */}
      <html lang="en" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
