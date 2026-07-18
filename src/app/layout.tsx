import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { APP_NAME, APP_URL } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — Premium URL Shortener`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Create branded short links, track analytics, and manage your URLs with a premium link management platform.",
  keywords: [
    "url shortener",
    "link shortener",
    "short links",
    "link analytics",
    "qr codes",
    "branded links",
  ],
  authors: [{ name: APP_NAME }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — Premium URL Shortener`,
    description:
      "Create branded short links, track analytics, and manage your URLs with a premium link management platform.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Premium URL Shortener`,
    description:
      "Create branded short links, track analytics, and manage your URLs with a premium link management platform.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#040810",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full`}
    >
      <body className="min-h-full overflow-x-hidden font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
