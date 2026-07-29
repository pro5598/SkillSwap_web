import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { GoogleOAuthWrapper } from "@/components/GoogleOAuthWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillSwap | Knowledge Barter Platform",
  description: "Modern, non-monetary skill exchange system.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#F8F9FE] text-[#0D1236] antialiased`} suppressHydrationWarning>
        <GoogleOAuthWrapper>
          <AuthProvider>
            <SocketProvider>{children}</SocketProvider>
          </AuthProvider>
        </GoogleOAuthWrapper>
      </body>
    </html>
  );
}