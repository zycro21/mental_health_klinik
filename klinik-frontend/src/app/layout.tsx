// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Nunito } from "next/font/google"

const inter = Inter({ subsets: ["latin"] });
const nunito = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Mental Klinik App",
    template: "%s | Mental Klinik App",
  },
  description: "Dashboard Klinik Kesehatan Mental",
  metadataBase: new URL("http://localhost:3000"), // ganti saat production
  openGraph: {
    title: "Mental Klinik App",
    description: "Dashboard Klinik Kesehatan Mental",
    url: "http://localhost:3000",
    siteName: "Mental Klinik",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mental Klinik App",
    description: "Dashboard Klinik Kesehatan Mental",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/next-2.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className={nunito.className}>{children}</body>
    </html>
  );
}
