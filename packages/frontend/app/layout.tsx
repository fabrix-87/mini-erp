// app/layout.tsx
import "./css/globals.css";
import { DM_Sans } from 'next/font/google'
import { Providers } from "./providers";
import type { Metadata } from "next";

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
})


export const metadata: Metadata = {
  title: "MyERP - Gestionale Aziendale",
  description: "Sistema di gestione aziendale completo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <link rel='icon' href='/favicon.svg' type='image/svg+xml' />
        <meta name="theme-color" content="#5d87ff" />
      </head>
      <body className={`${dmSans.className}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
