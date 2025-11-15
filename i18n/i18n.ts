import { getRequestConfig } from "next-intl/server"
import { notFound } from "next/navigation"

export const locales = ["ru", "tm"] as const
export const defaultLocale = "ru" as const

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // Fallback to default if undefined
  if (!locale) {
    locale = defaultLocale
  }

  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound()
  }

  try {
    const messages = (await import(`./messages/${locale}.json`)).default
    return {
      locale,
      messages,
    }
  } catch (error) {
    return {
      locale,
      messages: {},
    }
  }
})
