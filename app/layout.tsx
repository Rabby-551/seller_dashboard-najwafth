import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tableau de bord vendeur",
  description: "Tableau de bord vendeur de Books on Wheels",
  icons: {
    icon: "/assets/logo-icon.png",
    shortcut: "/assets/logo-icon.png",
    apple: "/assets/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
