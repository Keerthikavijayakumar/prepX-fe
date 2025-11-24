import type { Metadata } from "next";
import localFont from "next/font/local";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
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
});

export const metadata: Metadata = {
  title: "DevMock.ai | Next Gen Technical Interviews",
  description:
    "AI-powered mock interviews for developers with real-time feedback and deep technical evaluation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${circular.variable} ${sourceCodePro.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <Navbar />
          <main className="main-content">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
