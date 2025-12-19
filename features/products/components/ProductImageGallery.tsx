import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  noImageText: string;
}

export function ProductImageGallery({
  images,
  productName,
  noImageText,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const autoplayTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (images.length <= 1) return;

    const startAutoplay = () => {
      autoplayTimerRef.current = setInterval(() => {
        setSelectedImage((prev) => (prev + 1) % images.length);
      }, 3000);
    };

    startAutoplay();
    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [images.length]);

  const handleImageSelect = useCallback(
    (index: number) => {
      setSelectedImage(index);
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
      if (images.length > 1) {
        autoplayTimerRef.current = setInterval(() => {
          setSelectedImage((prev) => (prev + 1) % images.length);
        }, 3000);
      }
    },
    [images.length]
  );

  return (
    <div className="contents  max-w-2xl">
      <div className="relative">
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white">
          {images.length > 0 ? (
            <Image
              src={images[selectedImage]}
              alt={productName}
              fill
              className="object-contain"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              {noImageText}
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleImageSelect(index)}
                className={`relative w-16 h-16 shrink-0 rounded cursor-pointer overflow-hidden border-2 transition-all ${
                  selectedImage === index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Image
                  src={image}
                  alt={`${productName} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}