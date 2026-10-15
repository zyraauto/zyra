import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Inter, Montserrat } from 'next/font/google'
import { routing } from '@/i18n/routing'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'

// Inter para texto (--font-inter, la que usa --font-sans en globals.css) y Montserrat para títulos.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
})

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/*
        `contents` = este div no genera caja, así que no altera ningún layout (sidebars, h-screen, etc.),
        pero sí define --font-inter / --font-montserrat y aplica font-sans a todo lo que va dentro.
        Antes las fuentes se declaraban pero nunca se aplicaban (el <html className=...> estaba comentado),
        por eso --font-inter no existía y el texto caía a Serif.
      */}
      <div className={`${inter.variable} ${montserrat.variable} font-sans contents`}>
        <TooltipProvider>
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </div>
    </NextIntlClientProvider>
  )
}