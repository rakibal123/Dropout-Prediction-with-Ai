import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

import { ToastProvider } from "@/context/ToastContext";
import { Navbar } from "@/components/Navbar";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Student Dropout Risk Prediction System",
  description: "A modern platform for predicting and managing student dropout risks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-outfit antialiased`} suppressHydrationWarning>
        <ToastProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1">
              {children}
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
