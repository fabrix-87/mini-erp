// app/layout.tsx
import "./globals.css";
import { DM_Sans, Roboto } from "next/font/google";
import { Providers } from "./providers";
import type { Metadata } from "next";
import { getLocale, getMessages, getTimeZone } from "next-intl/server";
import { cn } from "@/lib/utils";

const robotoHeading = Roboto({subsets:['latin'],variable:'--font-heading'});

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
  const timeZone = await getTimeZone();

  return (
    <html lang="{lang}" suppressHydrationWarning data-scroll-behavior="smooth" className={cn(robotoHeading.variable)}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#5d87ff" />
      </head>
      <body className={`${dmSans.className}`}>
        <Providers locale={locale} messages={messages} timeZone={timeZone}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
