import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";
import { ToastProvider } from "@/components/Toast";
import { churchName } from "@/lib/data";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Adunare", template: "%s · Adunare" },
  description: "Aplicația liderilor de tineret: programe, laudă, echipă, voluntari și mesaje.",
  appleWebApp: { capable: true, title: "Adunare", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#1d1b3a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ToastProvider>
          <div className="shell">
            <div className="aurora" aria-hidden="true" />
            <main>{children}</main>
            <Nav churchName={churchName} />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
