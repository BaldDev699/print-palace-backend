import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/lib/router-compat";

interface ProductCardProps {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ title, description, imageUrl }) => {
  // All cards open the designer for now.
  // Later you can use: `/designer?template=${encodeURIComponent(title)}`
  const designerLink = "/designer";

  return (
    <Link
      to={designerLink}
      className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Image */}
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Gradient so the text is always readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

      {/* Arrow badge */}
      <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-900 shadow-md transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-45">
        <ArrowUpRight className="h-5 w-5" />
      </span>

      {/* Text */}
      <div className="absolute inset-x-0 bottom-0 p-6 text-left">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/75 line-clamp-2">
          {description}
        </p>
        <span className="mt-4 inline-block h-1 w-10 rounded-full bg-primary transition-all duration-300 group-hover:w-20" />
      </div>
    </Link>
  );
};

export default ProductCard;