import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/components/language";
import { isLocale } from "@/lib/i18n";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
export const metadata: Metadata = { title: "bentfolio — Your whole world, one grid", description: "Bring your projects, socials and favorite things together in one playful bento portfolio." };
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const value = (await cookies()).get("bentfolio-locale")?.value;
  const locale = isLocale(value) ? value : "en";
  return <html lang={locale}><body className={`${geist.variable} ${mono.variable}`}><LanguageProvider locale={locale}>{children}</LanguageProvider></body></html>;
}
