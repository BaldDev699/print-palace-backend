
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/router-compat';
import heroPrintingWorkshop from '@/assets/hero-printing-workshop.jpg';

const Hero = () => {
  return (
    <div className="relative bg-gray-800 text-white min-h-[70vh] flex items-center justify-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{ backgroundImage: `url(${heroPrintingWorkshop})` }}
      ></div>
      <div className="relative z-10 text-center p-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          Custom Prints, <span className="block">Uniquely Yours.</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-10 max-w-2xl mx-auto">
          High-quality apparel and promotional items, personalized with your design. Fast, reliable, and affordable.
        </p>
        <Button size="lg" className="text-lg px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
          <Link to="/designer">Start Your Project</Link>
        </Button>
      </div>
    </div>
  );
};

export default Hero;
