"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import DeliveryTypeSelector from "./DeliveryTypeSelector";
import { useTranslations } from "next-intl";
import type { DeliveryType, PaymentType, Province } from "@/lib/types/api";
import { useState } from "react";

interface OrderBillingItem {
  title: string;
  value: string;
}

interface OrderBilling {
  body: OrderBillingItem[];
  footer: {
    title: string;
    value: string;
  };
}

interface OrderSummaryProps {
  order: {
    id: number;
    billing: OrderBilling;
  };
  paymentType: PaymentType | null;
  deliveryType: DeliveryType;
  selectedRegion: string;
  selectedProvince: number | null;
  note: string;
  regionGroups: Record<string, Province[]>;
  availableRegions: string[];
  paymentTypes: PaymentType[];
  phone: string;
  name: string;
  lastName: string;
  onPhoneChange: (phone: string) => void;
  onNameChange: (name: string) => void;
  onLastNameChange: (lastName: string) => void;
  onPaymentTypeChange: (type: PaymentType) => void;
  onDeliveryTypeChange: (type: DeliveryType) => void;
  onRegionChange: (regionCode: string) => void;
  onProvinceChange: (provinceId: number) => void;
  onNoteChange: (note: string) => void;
  onCompleteOrder: () => void;
  isLoading: boolean;
}

export default function OrderSummary({
  order,
  paymentType,
  deliveryType,
  selectedRegion,
  selectedProvince,
  note,
  regionGroups,
  availableRegions,
  paymentTypes,
  phone,
  name,
  lastName,
  onPhoneChange,
  onNameChange,
  onLastNameChange,
  onPaymentTypeChange,
  onDeliveryTypeChange,
  onRegionChange,
  onProvinceChange,
  onNoteChange,
  onCompleteOrder,
  isLoading,
}: OrderSummaryProps) {
  const t = useTranslations();
  const [showValidation, setShowValidation] = useState(false);

  const provincesForSelectedRegion = selectedRegion
    ? regionGroups[selectedRegion] || []
    : [];

  const phoneDigits = phone.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length === 11;

  const isFormValid =
    selectedRegion &&
    selectedProvince &&
    paymentType &&
    isPhoneValid &&
    name.trim() !== "" &&
    lastName.trim() !== "";

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const prefix = "+993 ";

    if (input.length < prefix.length) {
      onPhoneChange(prefix);
      return;
    }

    const digitsOnly = input.substring(prefix.length).replace(/\D/g, "");

    const limitedDigits = digitsOnly.substring(0, 8);

    let formattedPhone = prefix;
    if (limitedDigits.length > 0) {
      formattedPhone += limitedDigits.substring(0, 2);

      if (limitedDigits.length > 2) {
        formattedPhone += " " + limitedDigits.substring(2);
      }
    }

    onPhoneChange(formattedPhone);
  };

  const handleCompleteOrderClick = () => {
    setShowValidation(true);
    if (isFormValid) {
      onCompleteOrder();
    }
  };

  return (
    <Card className="w-full md:w-[380px] p-4 md:p-6 rounded-xl h-fit sticky top-20">
      {/* Customer Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">
          {t("customer_information")}
        </h3>
        <div className="space-y-5">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              {t("name")}
            </Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={t("name")}
              className={`rounded-lg ${
                showValidation && name.trim() === "" ? "border-red-500" : ""
              }`}
            />
            {showValidation && name.trim() === "" && (
              <p className="text-xs text-red-500 mt-1">Bu alan zorunludur</p>
            )}
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">
              {t("last_name")}
            </Label>
            <Input
              type="text"
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              placeholder={t("last_name")}
              className={`rounded-lg ${
                showValidation && lastName.trim() === "" ? "border-red-500" : ""
              }`}
            />
            {showValidation && lastName.trim() === "" && (
              <p className="text-xs text-red-500 mt-1">Bu alan zorunludur</p>
            )}
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">
              {t("phone")}
            </Label>
            <Input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+993 61 097651"
              className={`rounded-lg ${
                showValidation && !isPhoneValid ? "border-red-500" : ""
              }`}
            />
            {showValidation && !isPhoneValid && (
              <p className="text-xs text-red-500 mt-1">
                Telefon 8 rakamdan oluşmalıdır
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Type */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">{t("payment_type")}</h3>
        <div className="flex gap-2">
          {paymentTypes.map((type) => (
            <Card
              key={type.id}
              className={`flex-1 cursor-pointer transition-all ${
                paymentType?.id === type.id
                  ? "border-2 border-[#005bff] bg-blue-50"
                  : showValidation && !paymentType
                  ? "border-2 border-red-500"
                  : "border-2 border-gray-200"
              }`}
              onClick={() => onPaymentTypeChange(type)}
            >
              <div className="flex flex-col items-center justify-center p-4 gap-2">
                <span
                  className={`text-xs font-medium ${
                    paymentType?.id === type.id ? "text-[#005bff]" : ""
                  }`}
                >
                  {type.name}
                </span>
              </div>
            </Card>
          ))}
        </div>
        {showValidation && !paymentType && (
          <p className="text-xs text-red-500 mt-1">Ödeme türü seçiniz</p>
        )}
      </div>

      {/* Region Selection */}
      <div className="mb-6">
        <Label className="text-lg font-semibold mb-3 block">
          {t("choose_region")}
        </Label>
        <RadioGroup
          value={selectedRegion}
          onValueChange={(value) => {
            onRegionChange(value);
            onProvinceChange(null as any);
          }}
          className="flex flex-wrap gap-4"
        >
          {availableRegions.map((regionCode) => (
            <div key={regionCode} className="flex items-center space-x-2">
              <RadioGroupItem
                value={regionCode}
                id={`region-${regionCode}`}
                className={`border-2 ${
                  showValidation && !selectedRegion
                    ? "border-red-500"
                    : "border-gray-400"
                } data-[state=checked]:border-[#005bff] data-[state=checked]:bg-white`}
              />
              <Label
                htmlFor={`region-${regionCode}`}
                className="cursor-pointer uppercase"
              >
                {regionCode}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {showValidation && !selectedRegion && (
          <p className="text-xs text-red-500 mt-1">Bölge seçiniz</p>
        )}
      </div>

      {/* Province Selection */}
      {selectedRegion && provincesForSelectedRegion.length > 0 && (
        <div className="mb-6">
          <Label className="text-lg font-semibold mb-3 block">
            {t("choose_address")}
          </Label>
          <Select
            value={selectedProvince?.toString() || ""}
            onValueChange={(value) => onProvinceChange(parseInt(value))}
          >
            <SelectTrigger
              className={`rounded-lg w-full ${
                showValidation && !selectedProvince ? "border-red-500" : ""
              }`}
            >
              <SelectValue placeholder={t("choose_address")} />
            </SelectTrigger>
            <SelectContent>
              {provincesForSelectedRegion.map((province) => (
                <SelectItem key={province.id} value={province.id.toString()}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showValidation && !selectedProvince && (
            <p className="text-xs text-red-500 mt-1">Adres seçiniz</p>
          )}
        </div>
      )}

      {/* Note */}
      <div className="mb-6">
        <Label className="text-lg font-semibold mb-3 block">{t("note")}</Label>
        <Textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          className="rounded-xl resize-none"
          rows={3}
          placeholder={t("note")}
        />
      </div>

      {/* Billing */}
      <div className="space-y-2 mb-4">
        {order.billing.body.map((item, index) => (
          <div
            key={index}
            className="flex justify-between text-base font-medium"
          >
            <span>{item.title}:</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between items-center mb-6">
        <span className="text-lg font-semibold">
          {order.billing.footer.title}:
        </span>
        <span className="text-lg font-bold text-green-600">
          {order.billing.footer.value}
        </span>
      </div>

      <Button
        onClick={handleCompleteOrderClick}
        disabled={isLoading}
        className="w-full rounded-lg cursor-pointer bg-[#005bff] hover:bg-[#004dcc] h-12 text-lg font-bold disabled:opacity-50"
        size="lg"
      >
        {isLoading ? `${t("order")}...` : t("order")}
      </Button>
    </Card>
  );
}
