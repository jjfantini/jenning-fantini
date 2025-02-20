import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RootProvider } from "../components/providers/root-provider";
import Navbar from "@/components/ui/navbar";
import { DATA } from "@/data/app-details";
import "./styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(DATA.url),
  title: {
    default: DATA.seo.title.default,
    template: DATA.seo.title.template,
  },
  description: DATA.description,
  openGraph: {
    title: DATA.seo.openGraph.title,
    description: DATA.seo.openGraph.description,
    url: DATA.url,
    siteName: DATA.seo.openGraph.siteName,
    locale: DATA.seo.openGraph.locale,
    type: DATA.seo.openGraph.type,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main className="flex-auto min-w-0 flex flex-col px-2" suppressHydrationWarning>
          <RootProvider>
            {children}
            <Navbar  />
          </RootProvider>
        </main>
      </body>
    </html>
  );
}
