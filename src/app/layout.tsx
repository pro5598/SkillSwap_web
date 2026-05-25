import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillSwap | Knowledge Barter Platform",
  description: "Modern, non-monetary skill exchange system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F8F9FE] text-[#0D1236] antialiased`}>
        {children}
      </body>
    </html>
  );
}