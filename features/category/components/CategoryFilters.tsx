import { useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { FilterBrand, FilterCategory } from "@/lib/types/api";

interface FiltersData {
  categories: FilterCategory[];
  brands: FilterBrand[];
}

interface CategoryFiltersProps {
  filtersData: FiltersData | undefined;
  selectedBrands: Set<number>;
  selectedFilterCategories: Set<number>;
  priceSort: "none" | "lowToHigh" | "highToLow";
  priceRange: [number, number];
  onBrandToggle: (brandId: number) => void;
  onCategoryToggle: (categoryId: number) => void;
  onPriceSortChange: (sortType: "none" | "lowToHigh" | "highToLow") => void;
  onPriceChange: (values: number[]) => void;
  onReset: () => void;
  translations: {
    category: string;
    brands: string;
    sort: string;
    default: string;
    price_low_to_high: string;
    price_high_to_low: string;
    price: string;
    price_from: string;
    price_to: string;
    reset: string;
  };
}

export default function CategoryFilters({
  filtersData,
  selectedBrands,
  selectedFilterCategories,
  priceSort,
  priceRange,
  onBrandToggle,
  onCategoryToggle,
  onPriceSortChange,
  onPriceChange,
  onReset,
  translations,
}: CategoryFiltersProps) {
  return (
    <div className="space-y-6 mb-6">
      {filtersData?.categories && filtersData.categories.length > 0 && (
        <FilterSection title={translations.category}>
          {filtersData.categories.map((category) => (
            <CheckboxItem
              key={category.id}
              checked={selectedFilterCategories.has(category.id)}
              onCheckedChange={() => onCategoryToggle(category.id)}
              label={category.name}
            />
          ))}
        </FilterSection>
      )}

      {filtersData?.brands && filtersData.brands.length > 0 && (
        <FilterSection title={translations.brands}>
          {filtersData.brands.map((brand) => (
            <CheckboxItem
              key={brand.id}
              checked={selectedBrands.has(brand.id)}
              onCheckedChange={() => onBrandToggle(brand.id)}
              label={brand.name}
            />
          ))}
        </FilterSection>
      )}

      <FilterSection title={translations.sort}>
        <RadioItem
          name="sort"
          checked={priceSort === "none"}
          onChange={() => onPriceSortChange("none")}
          label={translations.default}
        />
        <RadioItem
          name="sort"
          checked={priceSort === "lowToHigh"}
          onChange={() => onPriceSortChange("lowToHigh")}
          label={translations.price_low_to_high}
        />
        <RadioItem
          name="sort"
          checked={priceSort === "highToLow"}
          onChange={() => onPriceSortChange("highToLow")}
          label={translations.price_high_to_low}
        />
      </FilterSection>

      <PriceFilter
        title={translations.price}
        priceRange={priceRange}
        onPriceChange={onPriceChange}
        translations={{
          from: translations.price_from,
          to: translations.price_to,
        }}
      />

      <Button variant="outline" className="w-full rounded-lg cursor-pointer" onClick={onReset}>
        {translations.reset}
      </Button>
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CheckboxItem({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: () => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function RadioItem({
  name,
  checked,
  onChange,
  label,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4"
      />
      <span>{label}</span>
    </label>
  );
}

function PriceFilter({
  title,
  priceRange,
  onPriceChange,
  translations,
}: {
  title: string;
  priceRange: [number, number];
  onPriceChange: (values: number[]) => void;
  translations: { from: string; to: string };
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="price-from" className="text-xs mb-1">
              {translations.from}
            </Label>
            <Input
              id="price-from"
              type="number"
              value={priceRange[0]}
              onChange={(e) =>
                onPriceChange([parseInt(e.target.value) || 0, priceRange[1]])
              }
              className="rounded-lg"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="price-to" className="text-xs mb-1">
              {translations.to}
            </Label>
            <Input
              id="price-to"
              type="number"
              value={priceRange[1]}
              onChange={(e) =>
                onPriceChange([
                  priceRange[0],
                  parseInt(e.target.value) || 10000,
                ])
              }
              className="rounded-lg"
            />
          </div>
        </div>
        <Slider
          min={0}
          max={99999}
          step={100}
          value={priceRange}
          onValueChange={onPriceChange}
          className="mt-2"
        />
      </div>
    </div>
  );
}