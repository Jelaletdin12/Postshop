"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { X, Menu, Search, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import Logo from "@/public/logo.png"
import CategoryMenu from "./ui/CategoryMenu"
import SearchBar from "./ui/SearchBar"
import AuthDialog from "./ui/AuthDialog"
import ActionButtons from "./ui/ActionButtons"
import LanguageSelector from "./ui/LanguageSelector"

interface HeaderProps {
  locale?: string
  isAuthenticated?: boolean
  translations?: {
    catalog: string
    search: string
    orders: string
    favorites: string
    cart: string
    login: string
    profile: string
    openStore: string
    phone: string
    code: string
    send: string
    enterPhone: string
    weWillSendCode: string
  }
}

const DEFAULT_TRANSLATIONS = {
  catalog: "Каталог",
  search: "Поиск продукта",
  orders: "Заказы",
  favorites: "Избранное",
  cart: "Корзина",
  login: "Войти",
  profile: "Профиль",
  openStore: "Открыть магазин",
  phone: "Номер телефона",
  code: "Код",
  send: "Отправить",
  enterPhone: "Введите свой номер телефона",
  weWillSendCode: "Мы вышлем вам код",
}

export default function Header({ locale = "ru", isAuthenticated = false, translations }: HeaderProps) {
  const [isClient, setIsClient] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  const t = translations || DEFAULT_TRANSLATIONS

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleAuthClick = () => {
    if (isAuthenticated) {
      window.location.href = `/${locale}/me`
    } else {
      setIsLoginOpen(true)
    }
  }

  const toggleCategoryMenu = () => setIsCategoryOpen(!isCategoryOpen)
  const closeCategoryMenu = () => setIsCategoryOpen(false)

  if (!isClient) return null

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="shrink-0">
              <div className="relative h-8 w-[180px]">
                <Image src={Logo || "/placeholder.svg"} alt="Logo" fill className="object-contain" priority />
              </div>
            </Link>

            <Button
              onClick={toggleCategoryMenu}
              className="hidden gap-2 rounded-xl font-bold sm:flex hover:bg-[#005bff] bg-[#005bff] text-white"
              size="lg"
            >
              {isCategoryOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              {t.catalog}
            </Button>

            <div className="flex items-center gap-2 sm:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileSearchOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
              <LanguageSelector />
            </div>

            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            <SearchBar isMobile={false} searchPlaceholder={t.search} className="hidden flex-1 md:flex" />

            <ActionButtons
              isAuthenticated={isAuthenticated}
              onAuthClick={handleAuthClick}
              translations={{
                profile: t.profile,
                login: t.login,
                orders: t.orders,
                favorites: t.favorites,
                cart: t.cart,
              }}
            />
          </div>

          <Link href="/openStore">
            <Button variant="ghost" size="sm" className="relative flex gap-0.5 h-auto pb-2">
              <Store className="h-5 w-5 text-gray-600" />
              <span className="text-xs text-gray-700">{t.openStore}</span>
            </Button>
          </Link>
        </div>
      </header>

      <CategoryMenu isOpen={isCategoryOpen} onClose={closeCategoryMenu} />

      <SearchBar
        isMobile={true}
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
        searchPlaceholder={t.search}
      />

      <AuthDialog
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        translations={{
          enterPhone: t.enterPhone,
          weWillSendCode: t.weWillSendCode,
          phone: t.phone,
          code: t.code,
          send: t.send,
        }}
      />
    </>
  )
}
