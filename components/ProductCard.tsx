"use client";

import { useState, MouseEvent } from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, HeartOff, Minus, Plus } from "lucide-react";
import Image, { StaticImageData } from "next/image";
type ProductCardProps = {
  id: number;
  name: string;
  price: number | null;
  struct_price_text: string;
  discount?: number | null;
  discount_text?: string | null;
  images: (StaticImageData | string)[];
  is_favorite: boolean;
  labels?: { text: string; bg_color: string }[];
  price_color?: string;
  height?: number;
  width?: number;
  button?: boolean;
};

export default function ProductCard({
  id,
  name,
  price,
  struct_price_text,
  discount,
  discount_text,
  images,
  is_favorite,
  labels = [],
  price_color = "#005bff",
  height = 360,
  width = 280,
  button = true,
}: ProductCardProps) {
  const [favorite, setFavorite] = useState(is_favorite);
  const [cart, setCart] = useState(false);
  const [count, setCount] = useState(1);

  const handleFavorite = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite((prev) => !prev);
  };

  const handleAddToCart = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setCart(true);
  };

  const handleIncrement = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setCount((c) => c + 1);
  };

  const handleDecrement = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setCount((c) => (c > 1 ? c - 1 : c));
  };

  return (
    <Link href={`/product/${id}`} className="no-underline">
      <Card
        className={`relative gap-2 border-none shadow-none! p-0 w-full max-w-[${width}px] overflow-hidden rounded-2xl  hover:shadow-md transition-all cursor-pointer`}
        style={{ height }}
      >
        {/* Image Section */}
        <div className="relative w-full h-[260px] ">
          {images?.[0] && (
            <Image
              src={images[0]}
              alt={name}
              fill
              sizes="(max-width: 600px) 100vw, 33vw"
              className="object-contain "
              priority
            />
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 z-10 rounded-full bg-white/80 p-2 hover:bg-white"
          >
            {favorite ? (
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            ) : (
              <Heart className="w-5 h-5 text-gray-700" />
            )}
          </button>

          {/* Labels */}
          {labels?.length > 0 && (
            <div className="absolute bottom-2 left-2 flex flex-col gap-1">
              {labels.map((label) => (
                <Badge
                  key={label.text}
                  className="text-white text-[10px] font-bold uppercase rounded-r-md"
                  style={{ backgroundColor: label.bg_color }}
                >
                  {label.text}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-0 space-y-1">
          <p
            className="text-sm font-semibold mx-2"
            style={{ color: price_color }}
          >
            {struct_price_text}
          </p>
          <p className="text-gray-800 text-sm truncate mx-2">{name}</p>
        </CardContent>

        {/* Buttons */}
        {/* {button && (
          <div className="p-3">
            {!cart ? (
              <Button
                className="w-full font-bold text-base rounded-xl"
                onClick={handleAddToCart}
              >
                Заказать
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDecrement}
                  disabled={count === 1}
                  className="rounded-xl"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex-1 text-center text-gray-700 border rounded-xl py-2">
                  {count}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleIncrement}
                  className="rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )} */}
      </Card>
    </Link>
  );
}
