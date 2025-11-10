import createMiddleware from "next-intl/middleware"
import { locales, defaultLocale } from "./i18n"

const middleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
})

export default middleware

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
}