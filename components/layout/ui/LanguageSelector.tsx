"use client";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import tm from "@/public/tm.png";
import ru from "@/public/ru.png";

interface Language {
  code: string;
  name: string;
  flag: any;
}

const LANGUAGES: Language[] = [
  { code: "ru", name: "Russian", flag: ru },
  { code: "tm", name: "Turkmen", flag: tm },
];

export default function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const handleLanguageChange = async (newLocale: string) => {
    if (typeof window !== "undefined") {
      (window as any).i18n = { language: newLocale };
    }

    queryClient.invalidateQueries();

    const currentPath = pathname.replace(`/${locale}`, "");
    router.replace(`/${newLocale}${currentPath}`);
  };

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[70px] md:h-10! flex items-center justify-center rounded-lg border-gray-300">
        <SelectValue>
          <FlagIcon locale={locale} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center gap-2">
              <FlagIcon locale={language.code} />
              <span>{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function FlagIcon({ locale }: { locale: string }) {
  const language = LANGUAGES.find((lang) => lang.code === locale);

  if (!language) return null;

  return (
    <div className="relative h-5 w-7">
      <Image
        src={language.flag || "/placeholder.svg"}
        alt={language.name}
        fill
        className="object-cover rounded"
      />
    </div>
  );
}
