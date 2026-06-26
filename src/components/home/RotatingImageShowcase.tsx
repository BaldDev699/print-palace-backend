
import React from 'react';
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import showcaseCollection1 from '@/assets/showcase-collection-1.jpg';
import showcasePrintingProcess from '@/assets/showcase-printing-process.jpg';
import showcaseTeamUniforms from '@/assets/showcase-team-uniforms.jpg';
import showcaseEmbroidery from '@/assets/showcase-embroidery.jpg';
import showcasePromotionalItems from '@/assets/showcase-promotional-items.jpg';

const images = [
  { src: showcaseCollection1, alt: "Collection of custom printed apparel showcasing quality and variety" },
  { src: showcasePrintingProcess, alt: "Screen printing process in action showing professional equipment" },
  { src: showcaseTeamUniforms, alt: "Team wearing matching custom printed company uniforms" },
  { src: showcaseEmbroidery, alt: "Custom embroidery machine working on detailed logo design" },
  { src: showcasePromotionalItems, alt: "Various custom printed promotional items and marketing materials" },
];

const RotatingImageShowcase = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <section className="py-12 md:py-16 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-10">
          Latest Styles & Inspiration
        </h2>
        <Carousel
          plugins={[plugin.current]}
          className="w-full max-w-4xl mx-auto"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-[16/9] items-center justify-center p-0 overflow-hidden rounded-lg">
                      <img 
                        src={image.src} 
                        alt={image.alt} 
                        className="w-full h-full object-cover"
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden sm:flex" />
          <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default RotatingImageShowcase;
