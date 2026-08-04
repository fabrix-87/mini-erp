// app/layout.tsx
import "./globals.css";
import { DM_Sans } from "next/font/google";
import { Providers } from "./providers";
import type { Metadata } from "next";
import { getLocale, getMessages } from "next-intl/server";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "MyERP - Gestionale Aziendale",
  description: "Sistema di gestione aziendale completo",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Recupera il locale rilevato dal middleware (da cookie o browser)
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang="{lang}" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#5d87ff" />
      </head>
      <body className={`${dmSans.className}`}>
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
