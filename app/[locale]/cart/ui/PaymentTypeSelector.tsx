import React from "react";
import { CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PaymentType, CartTranslations } from "./types";

interface PaymentTypeSelectorProps {
  selectedType: PaymentType;
  onSelect: (type: PaymentType) => void;
  translations: CartTranslations;
}

export default function PaymentTypeSelector({
  selectedType,
  onSelect,
  translations: t,
}: PaymentTypeSelectorProps) {
  const paymentOptions: { type: PaymentType; label: string }[] = [
    { type: "CASH", label: t.cash },
    { type: "CARD", label: t.card },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">{t.paymentType}</h3>
      <div className="flex gap-2">
        {paymentOptions.map(({ type, label }) => (
          <Card
            key={type}
            className={`flex-1 cursor-pointer transition-all ${
              selectedType === type
                ? "border-2 border-[#005bff]"
                : "border-2 border-gray-200"
            }`}
            onClick={() => onSelect(type)}
          >
            <div className="flex flex-col items-center justify-center p-4 gap-2">
              <CreditCard
                className={`h-8 w-8 ${
                  selectedType === type ? "text-[#005bff]" : ""
                }`}
              />
              <span className="text-xs">{label}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}