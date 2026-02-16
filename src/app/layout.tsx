import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";

const circular = localFont({
  src: [
    {
      path: "./fonts/CircularStd-Book.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-custom",
  display: "swap",
  preload: true,
});

const sourceCodePro = localFont({
  src: [
    {
      path: "./fonts/SourceCodePro-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-source-code-pro",
  display: "swap",
  preload: true,
});

// SEO Metadata
export const metadata: Metadata = {
  title: {
    default: "PrepX | AI Mock Interviews for Software Engineers",
    template: "%s | PrepX",
  },
  description:
    "Practice technical interviews with PrepX's AI-powered mock interview platform. Real-time feedback on coding, system design, and behavioral rounds. Personalized coaching based on your resume.",
  keywords: [
    "mock interview",
    "technical interview",
    "coding interview",
    "system design interview",
    "behavioral interview",
    "AI interview",
    "software engineer interview",
    "interview practice",
    "interview preparation",
    "tech interview",
    "interview coach",
    "PrepX",
  ],
  authors: [{ name: "PrepX" }],
  creator: "PrepX",
  publisher: "PrepX",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://PrepX.io",
    siteName: "PrepX",
    title: "PrepX | AI Mock Interviews for Software Engineers",
    description:
      "Practice technical interviews with AI. Get real-time feedback on coding, system design, and behavioral rounds.",
    images: [
      {
        url: "/logos/prepX-logo.png",
        width: 1200,
        height: 630,
        alt: "PrepX - AI Mock Interviews",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepX | AI Mock Interviews for Software Engineers",
    description:
      "Practice technical interviews with AI. Get real-time feedback on coding, system design, and behavioral rounds.",
    images: ["/logos/prepX-logo.png"],
  },
  metadataBase: new URL("https://PrepX.io"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/logos/favi.png", type: "image/png" },
    ],
    apple: [
      { url: "/logos/favi.png", type: "image/png" },
    ],
    shortcut: "/logos/favi.png",
  },
  manifest: "/manifest.json",
};

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PrepX",
  applicationCategory: "Education",
  description:
    "AI-powered mock interview platform for software engineers. Practice coding, system design, and behavioral interviews with real-time feedback.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free to start",
  },
  operatingSystem: "Web Browser",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1250",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical fonts for faster LCP */}
        <link
          rel="preload"
          href="/fonts/CircularStd-Book.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />

        {/* DNS prefetch for external services */}
        <link rel="dns-prefetch" href="https://supabase.co" />
        <link rel="dns-prefetch" href="https://livekit.io" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${circular.variable} ${sourceCodePro.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <ErrorBoundary>
              <main id="main-content" role="main">
                {children}
              </main>
            </ErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
