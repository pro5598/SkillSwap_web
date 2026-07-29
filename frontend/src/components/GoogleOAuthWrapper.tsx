"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export function GoogleOAuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider
      clientId={GOOGLE_CLIENT_ID}
      onScriptLoadError={() => console.error("Google OAuth script failed to load")}
    >
      {children}
    </GoogleOAuthProvider>
  );
}
