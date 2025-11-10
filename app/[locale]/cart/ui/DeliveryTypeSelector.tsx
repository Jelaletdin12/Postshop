import React from "react";
import { Truck, Warehouse } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DeliveryType, CartTranslations } from "./types";

interface DeliveryTypeSelectorProps {
  selectedType: DeliveryType;
  onSelect: (type: DeliveryType) => void;
  translations: CartTranslations;
}

export default function DeliveryTypeSelector({
  selectedType,
  onSelect,
  translations: t,
}: DeliveryTypeSelectorProps) {
  const deliveryOptions: {
    type: DeliveryType;
    label: string;
    icon: typeof Truck;
  }[] = [
    { type: "SELECTED_DELIVERY", label: t.delivery, icon: Truck },
    { type: "PICK_UP", label: t.pickup, icon: Warehouse },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">{t.deliveryType}</h3>
      <div className="flex gap-2">
        {deliveryOptions.map(({ type, label, icon: Icon }) => (
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
              <Icon
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