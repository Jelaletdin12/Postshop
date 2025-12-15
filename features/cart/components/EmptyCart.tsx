import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function EmptyCart() {
  const t=useTranslations();
  const router=useRouter();
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-blue-50 to-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <ShoppingCart className="h-10 w-10 text-blue-600" />
        </div>

        <h2 className="mb-2 text-2xl font-semibold text-gray-900">
          {t("cart_empty")}
        </h2>

        <p className="mb-6 text-sm text-gray-500">
          {t("cart_empty_message")}
        </p>

        <Button onClick={()=>router.push("/")} className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-95">
          {t("start_shopping")}
        </Button>
      </div>
    </div>
  );
}