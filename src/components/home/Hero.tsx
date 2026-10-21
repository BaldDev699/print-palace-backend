import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import heroPrintingWorkshop from "@/assets/hero-printing-workshop.jpg";

const Hero = () => {
  return (
    <div className="relative bg-neutral-950 text-white min-h-[75vh] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroPrintingWorkshop})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <span className="inline-block mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
            Custom print studio
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-[1.1]">
            Custom Prints,
            <span className="block text-primary">Uniquely Yours.</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-xl">
            High-quality apparel and promotional items, personalized with your design. Fast,
            reliable, and affordable.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="text-base px-8" asChild>
              <Link to="/designer">Start Your Project</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 border-white/40 bg-transparent text-white hover:bg-white hover:text-black"
              asChild
            >
              <Link to="/collection">Browse Collection</Link>
            </Button>
          </div>

          <p className="mt-8 text-sm text-white/60">
            Verified manufacturers · Fast delivery · Fully custom designs
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;