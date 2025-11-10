"use client"

import { useLocale } from "next-intl"

export function useLocaleInfo() {
  const locale = useLocale()

  return {
    locale,
    isRussian: locale === "ru",
    isTurkmen: locale === "tm",
  }
}

export function getLocaleFlag(locale: string) {
  const flags: Record<string, string> = {
    ru: "🇷🇺",
    tm: "🇹🇲",
  }
  return flags[locale] || "🌐"
}

export function getLocaleName(locale: string) {
  const names: Record<string, string> = {
    ru: "Русский",
    tm: "Türkmençe",
  }
  return names[locale] || locale.toUpperCase()
}
