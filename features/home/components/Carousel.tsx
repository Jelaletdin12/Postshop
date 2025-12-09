"use client"
import Image, { type StaticImageData } from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay } from "swiper/modules"
import "swiper/css"

type CarouselItem = {
  title: string
  image: StaticImageData | string
  url?: string | null
}

export default function HeroCarousel({ items }: { items: CarouselItem[] }) {
  return (
    <section className="rounded-2xl overflow-hidden">
      <Swiper 
        modules={[Autoplay]} 
        slidesPerView={1} 
        loop 
        autoplay={{ delay: 3000, disableOnInteraction: false }}
      >
        {items.map((item, i) => (
          <SwiperSlide key={i}>
            <div className="relative w-full h-[200px] sm:h-[300px] md:h-[496px]">
              <Image 
                src={item.image} 
                alt={item.title} 
                fill 
                className="object-cover"
                priority={i === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}