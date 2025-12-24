import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"
import "./globals.css"
import Header from "@/components/layout/Header"
import MobileBottomNav from "@/components/layout/MobileBar"
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/context/Provider"
import AuthWrapper from "@/context/AuthWrapper"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Postshop",
  description: "E-commerce platform",
}

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const locales = ["ru", "tm"]

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params

  if (!locales.includes(locale)) notFound()

  let messages
  try {
    messages = (await import(`../../i18n/messages/${locale}.json`)).default
  } catch {
    messages = {}
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <AuthWrapper locale={locale}>
              <Header locale={locale} />
              {children}
              <MobileBottomNav locale={locale} />
              <Toaster />
            </AuthWrapper>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  )
}