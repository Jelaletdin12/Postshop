"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Search, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/public/logo.webp";
import CategoryMenu from "./ui/CategoryMenu";
import SearchBar from "./ui/SearchBar";
import AuthDialog from "./ui/AuthDialog";
import ActionButtons from "./ui/ActionButtons";
import LanguageSelector from "./ui/LanguageSelector";
import MobileBottomNav from "./MobileBar";
import { useAuthStatus } from "@/lib/hooks/useAuth";
import { useTranslations } from "next-intl";
import { CategoryIcon } from "../icons";

interface HeaderProps {
  locale?: string;
}

export default function Header({ locale = "ru" }: HeaderProps) {
  const [isClient, setIsClient] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const t = useTranslations();

  const { isAuthenticated } = useAuthStatus();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAuthClick = useCallback(() => {
    if (isAuthenticated) {
      window.location.href = `/${locale}/me`;
    } else {
      setIsLoginOpen(true);
    }
  }, [isAuthenticated, locale]);

  const toggleCategoryMenu = useCallback(() => {
    setIsCategoryOpen((prev) => !prev);
  }, []);

  const closeCategoryMenu = useCallback(() => {
    setIsCategoryOpen(false);
  }, []);

  if (!isClient) return null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className=" mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-3">
            <Link href="/" className="shrink-0">
              <div className="relative h-8 w-[180px]">
                <Image
                  src={Logo}
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            <Button
              onClick={toggleCategoryMenu}
              className="cursor-pointer hidden gap-2 rounded-lg font-bold lg:flex hover:bg-[#005bff] bg-[#005bff] text-white"
              size="lg"
            >
              {isCategoryOpen ? <X className="h-5 w-5" /> : <CategoryIcon />}
              {t("common.catalog")}
            </Button>

            <div className="flex items-center gap-2 sm:hidden cursor-pointer">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
              <LanguageSelector />
            </div>

            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            <SearchBar
              isMobile={false}
              searchPlaceholder={t("common.search")}
              className="hidden flex-1 md:flex"
              locale={locale}
            />

            <ActionButtons
              isAuthenticated={isAuthenticated}
              onAuthClick={handleAuthClick}
            />
          </div>
        </div>
      </header>

      <CategoryMenu isOpen={isCategoryOpen} onClose={closeCategoryMenu} />

      <SearchBar
        isMobile={true}
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
        searchPlaceholder={t("common.search")}
        locale={locale}
      />

      <AuthDialog isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      <MobileBottomNav
        locale={locale}
        onLoginClick={() => {
          setIsLoginOpen(true);
        }}
      />
    </>
  );
}
