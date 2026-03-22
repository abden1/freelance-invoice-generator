import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "FLtool — Invoice & Contract Generator",
    template: "%s | FLtool",
  },
  description:
    "Professional invoicing, contracts, and payment tracking for freelancers. Create beautiful invoices, manage clients, and get paid faster.",
  keywords: ["invoice generator", "freelance contracts", "payment tracking", "invoice software"],
  openGraph: {
    type: "website",
    title: "FLtool — Invoice & Contract Generator",
    description: "Professional invoicing and contracts for freelancers",
    siteName: "FLtool",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-right" richColors closeButton />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
