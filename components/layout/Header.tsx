"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Menu, Search, Store, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "@/public/logo.png";
import CategoryMenu from "./ui/CategoryMenu";
import SearchBar from "./ui/SearchBar";
import AuthDialog from "./ui/AuthDialog";
import ActionButtons from "./ui/ActionButtons";
import LanguageSelector from "./ui/LanguageSelector";
import { useAuthStatus, useLogout } from "@/lib/hooks/useAuth";
import { useTranslations } from "next-intl";

interface HeaderProps {
  locale?: string;
}

export default function Header({ locale = "ru" }: HeaderProps) {
  const [isClient, setIsClient] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const t = useTranslations();

  const { isAuthenticated, isLoading } = useAuthStatus();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

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

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

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
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="shrink-0">
              <div className="relative h-8 w-[180px]">
                <Image src={Logo} alt="Logo" fill className="object-contain" priority />
              </div>
            </Link>

            <Button
              onClick={toggleCategoryMenu}
              className="hidden gap-2 rounded-xl font-bold sm:flex hover:bg-[#005bff] bg-[#005bff] text-white"
              size="lg"
            >
              {isCategoryOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              {t("common.catalog")}
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

          <Link href="/openStore">
            <Button variant="ghost" size="sm" className="relative flex gap-0.5 h-auto pb-2">
              <Store className="h-5 w-5 text-gray-600" />
              <span className="text-xs text-gray-700">{t("common.openStore")}</span>
            </Button>
          </Link>
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

      <AuthDialog
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
}