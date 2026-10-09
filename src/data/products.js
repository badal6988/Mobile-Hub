import cable from "../assets/products/cable.jpg";
import carHolder from "../assets/products/car-holder.jpg";
import phoneCase from "../assets/products/case.jpg";
import charger from "../assets/products/charger.jpg";
import powerbank from "../assets/products/powerbank.jpg";
import stand from "../assets/products/stand.jpg";
import smartwatch from "../assets/products/strap.jpg";
import earbuds from "../assets/products/w-earbuds.jpg";

const products = [
  {
    id: 1,
    name: "Braided USB-C Cable",
    category: "Cables",
    price: 499,
    oldPrice: 699,
    rating: 4.5,
    description:
      "Durable braided USB-C cable designed for fast charging and reliable data transfer.",
    image: cable,
  },

  {
    id: 2,
    name: "MagSafe Clear Case",
    category: "Cases",
    price: 799,
    oldPrice: 999,
    rating: 4.6,
    description:
      "Slim transparent protective case with MagSafe-compatible magnetic ring.",
    image: phoneCase,
  },

  {
    id: 3,
    name: "10,000mAh Power Bank",
    category: "Power Banks",
    price: 1299,
    oldPrice: 1599,
    rating: 4.7,
    description:
      "Portable 10,000mAh power bank with fast charging support.",
    image: powerbank,
  },

  {
    id: 4,
    name: "Magnetic Phone Stand",
    category: "Stands",
    price: 699,
    oldPrice: 899,
    rating: 4.6,
    description:
      "Adjustable magnetic phone stand for your desk or workspace.",
    image: stand,
  },

  {
    id: 5,
    name: "Car Phone Holder",
    category: "Car Accessories",
    price: 899,
    oldPrice: 1199,
    rating: 4.5,
    description:
      "Secure dashboard phone holder for convenient hands-free navigation.",
    image: carHolder,
  },

  {
    id: 6,
    name: "Smartwatch Strap",
    category: "Wearables",
    price: 499,
    oldPrice: 699,
    rating: 4.4,
    description:
      "Comfortable and durable replacement strap suitable for everyday smartwatch use.",
    image: smartwatch,
  },

  {
    id: 7,
    name: "Wireless Earbuds",
    category: "Audio",
    price: 1799,
    oldPrice: 2299,
    rating: 4.4,
    description:
      "Lightweight wireless earbuds with touch controls and a compact charging case.",
    image: earbuds,
  },

  {
    id: 8,
    name: "20W Fast Charger",
    category: "Chargers",
    price: 999,
    oldPrice: 1299,
    rating: 4.7,
    description:
      "Compact 20W USB-C fast charger for phones and tablets.",
    image: charger,
  },
];

export default products;