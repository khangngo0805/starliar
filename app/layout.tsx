import type { Metadata } from "next";
import { LanguageProvider } from "@/components/storefront/language-provider";
import { StorefrontFooterGate } from "@/components/storefront/storefront-footer";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Starlier",
  description: "Cinematic unisex fashion commerce for Starlier."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          {children}
          <StorefrontFooterGate />
        </LanguageProvider>
      </body>
    </html>
  );
}
