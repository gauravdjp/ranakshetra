import type { Metadata } from "next";
import { Outfit, Inter, DM_Mono} from "next/font/google";
import "../globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});


export const metadata: Metadata = {
  title: "Ranakshetra",
  description: "The Eternal Battlefield",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} ${dmMono.variable}`}>
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
