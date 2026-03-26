import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "ServiceHub – Home Services at Your Doorstep",
  description: "Professional home services delivered to your door. Trusted, verified, and always on time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${sora.variable} h-full antialiased`}
    >
      <body className={`min-h-full flex flex-col font-sans bg-slate2-50`}>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
