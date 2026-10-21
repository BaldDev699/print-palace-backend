import React from "react";
import ProductCard from "./ProductCard";
import customTshirtMockup from "@/assets/custom-tshirt-mockup.jpg";
import customHoodieMockup from "@/assets/custom-hoodie-mockup.jpg";
import customCapMockup from "@/assets/custom-cap-mockup.jpg";

const products = [
  {
    title: "Custom T-Shirts",
    description:
      "High-quality cotton t-shirts, perfect for events, teams, or personal style. Variety of colors and sizes.",
    imageUrl: customTshirtMockup,
    link: "#tshirts",
  },
  {
    title: "Personalized Hoodies",
    description:
      "Comfortable and stylish hoodies. Ideal for groups, merchandise, or everyday wear. Print or embroidery.",
    imageUrl: customHoodieMockup,
    link: "#hoodies",
  },
  {
    title: "Branded Caps & Hats",
    description: "Custom caps and hats for your brand, team, or event. Various styles available.",
    imageUrl: customCapMockup,
    link: "#caps",
  },
];

const ProductShowcase = () => {
  return (
    <section id="products" className="py-16 lg:py-24 bg-background">
      <div className="text-center mb-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          Our products
        </span>
        <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          What Would You Like to Print?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.title}
              title={product.title}
              description={product.description}
              imageUrl={product.imageUrl}
              link={product.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
