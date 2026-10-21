import React, { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/lib/router-compat";
import showcaseCollection1 from "@/assets/showcase-collection-1.jpg";
import showcasePrintingProcess from "@/assets/showcase-printing-process.jpg";
import showcaseTeamUniforms from "@/assets/showcase-team-uniforms.jpg";
import showcaseEmbroidery from "@/assets/showcase-embroidery.jpg";
import showcasePromotionalItems from "@/assets/showcase-promotional-items.jpg";

const slides = [
  {
    src: showcaseCollection1,
    alt: "Collection of custom printed apparel",
    label: "Apparel",
    title: "Tees, hoodies and totes with your design",
  },
  {
    src: showcasePrintingProcess,
    alt: "Screen printing process in action",
    label: "Printing",
    title: "Professional printing, done right",
  },
  {
    src: showcaseTeamUniforms,
    alt: "Team wearing matching custom uniforms",
    label: "Teams & Business",
    title: "Matching uniforms for your whole team",
  },
  {
    src: showcaseEmbroidery,
    alt: "Custom embroidery on a logo design",
    label: "Embroidery",
    title: "Premium stitched logos that last",
  },
  {
    src: showcasePromotionalItems,
    alt: "Custom printed promotional items",
    label: "Promotional",
    title: "Banners, flags, bands and more",
  },
];

const INTERVAL = 4500;

const RotatingImageShowcase = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), []);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + slides.length) % slides.length),
    [],
  );

  // Restarts the timer every time the slide changes (auto or manual)
  useEffect(() => {
    if (paused) return;
    const id = setTimeout(next, INTERVAL);
    return () => clearTimeout(id);
  }, [index, paused, next]);

  return (
    <section className="py-16 md:py-24 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Inspiration
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Latest Styles & Inspiration
          </h2>
        </div>

        <div
          className="relative w-full max-w-5xl mx-auto aspect-[4/3] sm:aspect-[16/9] overflow-hidden rounded-2xl shadow-xl bg-neutral-900"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Slides: stacked, crossfading, with a slow zoom on the active one */}
          {slides.map((slide, i) => (
            <img
              key={slide.alt}
              src={slide.src}
              alt={slide.alt}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                opacity: i === index ? 1 : 0,
                transform: i === index ? "scale(1.08)" : "scale(1)",
                transition: "opacity 1000ms ease, transform 6000ms ease-out",
              }}
            />
          ))}

          {/* Dark gradient so the caption is always readable */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Caption */}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div key={index} className="animate-in fade-in slide-in-from-bottom-2 duration-700">
              <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                {slides[index].label}
              </span>
              <h3 className="mt-3 text-xl sm:text-3xl font-bold text-white max-w-xl leading-tight">
                {slides[index].title}
              </h3>
            </div>
            <Link
              to="/designer"
              className="shrink-0 inline-flex items-center justify-center rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-white/90 transition-colors"
            >
              Design yours
            </Link>
          </div>

          {/* Arrows */}
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white hover:text-black transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white hover:text-black transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots: the active one stretches into a pill */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.alt}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === index ? "w-8 bg-primary" : "w-2 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RotatingImageShowcase;