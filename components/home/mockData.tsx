import temp1 from "@/public/temp1.jpg"
import temp2 from "@/public/temp2.jpg"
import temp3 from "@/public/temp3.jpg"
import jbl from "@/public/jbl.png"
import jbll from "@/public/jbll.png"
import jbl3 from "@/public/jbl3.webp"
import jb from "@/public/jb.webp"

export const carouselItems = [
  { title: "Banner 1", image: temp1, url: "#" },
  { title: "Banner 2", image: temp2, url: "#" },
  { title: "Banner 3", image: temp3, url: "#" },
]

export const categories = [
  { id: 1, slug: "sneakers", name: "Sneakers", image: jbl },
  { id: 2, slug: "boots", name: "Boots", image: jbl3 },
  { id: 3, slug: "sandals", name: "Sandals", image: jbll },
  { id: 4, slug: "heels", name: "Heels", image: jb },
]

export const products = [
  {
    id: 1,
    name: "Nike Air Max 270",
    struct_price_text: "$120",
    price: 120,
    images: [jb, jbll, jbl, jbl3],
    is_favorite: false,
    labels: [{ text: "New", bg_color: "#10B981" }],
  },
  {
    id: 2,
    name: "Adidas Ultraboost",
    struct_price_text: "$150",
    price: 150,
    images: [jbll, jb, jbl, jbl3],
    is_favorite: true,
  },
  {
    id: 3,
    name: "Puma RS-X",
    struct_price_text: "$110",
    price: 110,
    images: [jbl3, jbll, jbl, jb],
    is_favorite: false,
  },
  {
    id: 4,
    name: "New Balance 327",
    struct_price_text: "$130",
    price: 130,
    images: [jbl, jbll, jb, jbl3],
    is_favorite: false,
  },
]