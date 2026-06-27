import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat"; // Import Link

interface ProductCardProps {
  title: string;
  description: string;
  imageUrl: string;
  link: string; // This 'link' prop might become an identifier or be removed if all products go to the same designer
}

const ProductCard: React.FC<ProductCardProps> = ({ title, description, imageUrl, link }) => {
  // For now, all product cards will link to the generic /designer page.
  // In the future, 'link' prop could be used to pass product-specific info e.g. /designer?product=tshirt
  const designerLink = "/designer";

  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden flex flex-col">
      <img src={imageUrl} alt={title} className="w-full h-64 object-cover" />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-semibold text-foreground mb-3">{title}</h3>
        <p className="text-muted-foreground mb-4 flex-grow">{description}</p>
        <Button
          asChild
          variant="outline"
          className="mt-auto w-full group hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <Link to={designerLink}>
            View Details{" "}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
