import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";

export const locales       = ["es", "en"] as const;
export const defaultLocale = "es" as const;
export type Locale         = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale    = hasLocale(locales, requested) ? requested : defaultLocale;

  return {
    locale,
    // ✅ src/i18n/ → ../messages/ = src/messages/
    messages: (await import(`../messages/${locale}/common.json`)).default,
  };
});