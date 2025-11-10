"use client"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DeliveryTypeSelector from "./DeliveryTypeSelector"
import type { Order, Region, Address, DeliveryType, CartTranslations, PaymentTypeOption } from "./types"

interface OrderSummaryProps {
  order: Order
  translations: CartTranslations
  paymentType: PaymentTypeOption | null
  deliveryType: DeliveryType
  selectedRegion: string | null
  selectedAddress: string
  note: string
  regions: Region[]
  addresses: Address[]
  paymentTypes: PaymentTypeOption[]
  onPaymentTypeChange: (type: PaymentTypeOption) => void
  onDeliveryTypeChange: (type: DeliveryType) => void
  onRegionChange: (regionCode: string) => void
  onAddressChange: (address: string) => void
  onNoteChange: (note: string) => void
  onMapOpen: () => void
  onCompleteOrder: () => void
  isLoading: boolean
}

export default function OrderSummary({
  order,
  translations: t,
  paymentType,
  deliveryType,
  selectedRegion,
  selectedAddress,
  note,
  regions,
  addresses,
  paymentTypes,
  onPaymentTypeChange,
  onDeliveryTypeChange,
  onRegionChange,
  onAddressChange,
  onNoteChange,
  onMapOpen,
  onCompleteOrder,
  isLoading,
}: OrderSummaryProps) {
  const filteredAddresses = selectedRegion
    ? addresses.filter((addr) => {
        const region = regions.find((r) => r.code === selectedRegion)
        return region && addr.region_id === region.id
      })
    : []

  const isFormValid = selectedRegion && selectedAddress && paymentType

  return (
    <Card className="w-full md:w-[380px] p-6 rounded-xl h-fit sticky top-20">
      {/* Payment Type */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">{t.paymentType}</h3>
        <div className="flex gap-2">
          {paymentTypes.map((type) => (
            <Card
              key={type.id}
              className={`flex-1 cursor-pointer transition-all ${
                paymentType?.id === type.id ? "border-2 border-[#005bff]" : "border-2 border-gray-200"
              }`}
              onClick={() => onPaymentTypeChange(type)}
            >
              <div className="flex flex-col items-center justify-center p-4 gap-2">
                <span className="text-xs font-medium">{type.name}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Delivery Type */}
      <DeliveryTypeSelector selectedType={deliveryType} onSelect={onDeliveryTypeChange} translations={t} />

      {/* Region Selection */}
      <div className="mb-6">
        <Label className="text-lg font-semibold mb-3 block">{t.selectRegion}</Label>
        <RadioGroup value={selectedRegion || ""} onValueChange={onRegionChange} className="flex flex-wrap gap-4">
          {regions.map((region) => (
            <div key={region.id} className="flex items-center space-x-2">
              <RadioGroupItem
                value={region.code}
                id={`region-${region.id}`}
                className="border-2 border-gray-400 data-[state=checked]:border-[#005bff] data-[state=checked]:bg-white data-[state=checked]:[&_svg]:fill-[#005bff] data-[state=checked]:[&_svg]:stroke-[#005bff]"
              />
              <Label htmlFor={`region-${region.id}`} className="cursor-pointer">
                {region.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Address Selection */}
      {filteredAddresses.length > 0 && (
        <div className="mb-6">
          <Label className="text-lg font-semibold mb-3 block">{t.selectAddress}</Label>
          <div className="flex gap-2">
            <Select value={selectedAddress} onValueChange={onAddressChange}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={t.selectAddress} />
              </SelectTrigger>
              <SelectContent>
                {filteredAddresses.map((addr) => (
                  <SelectItem key={addr.id} value={addr.address}>
                    {addr.title} - {addr.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={onMapOpen}
              className="rounded-xl flex-shrink-0 bg-transparent"
            >
              <MapPin className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Note */}
      <div className="mb-6">
        <Label className="text-lg font-semibold mb-3 block">{t.note}</Label>
        <Textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          className="rounded-xl resize-none"
          rows={3}
          placeholder={t.note}
        />
      </div>

      {/* Billing Summary */}
      <div className="space-y-2 mb-4">
        {order.billing.body.map((item, index) => (
          <div key={index} className="flex justify-between text-base font-medium">
            <span>{item.title}:</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      {/* Total */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-lg font-semibold">{order.billing.footer.title}:</span>
        <span className="text-lg font-bold text-green-600">{order.billing.footer.value}</span>
      </div>

      {/* Complete Order Button */}
      <Button
        onClick={onCompleteOrder}
        disabled={!isFormValid || isLoading}
        className="w-full rounded-xl bg-[#005bff] hover:bg-[#005bff] cursor-pointer h-12 text-lg font-bold disabled:opacity-50"
        size="lg"
      >
        {isLoading ? t.placeOrder + "..." : t.placeOrder}
      </Button>
    </Card>
  )
}
