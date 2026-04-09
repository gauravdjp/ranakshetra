import type { Metadata } from "next";
import { Cinzel, Rajdhani } from "next/font/google";
import "../globals.css";
import Header from "../../components/header";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
  weight : ["400", "600", "700", "900"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  display: "swap",
  weight : ["300", "400","500", "600", "700"],
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
    <html lang="en">
      <body
        className={`${cinzel.variable} ${rajdhani.variable} antialiased`}
      >
        {/*<Header />*/}
        <main className = "pt-72px">
          {children}
        </main>
        
      </body>
    </html>
  );
}
