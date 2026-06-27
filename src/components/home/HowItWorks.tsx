import React from "react";
import HowItWorksStep from "./HowItWorksStep";
import { Lightbulb, Pencil, ShoppingCart, Truck } from "lucide-react"; // Example icons

const steps = [
  {
    stepNumber: 1,
    title: "Share Your Idea",
    description: "Tell us about your project, desired design, and quantity. We are here to help!",
    IconComponent: Lightbulb,
  },
  {
    stepNumber: 2,
    title: "We Design & Confirm",
    description: "Our team creates a digital mockup for your approval. Revisions are welcome!",
    IconComponent: Pencil,
  },
  {
    stepNumber: 3,
    title: "Production Time",
    description: "Once approved, we start the printing process using high-quality materials.",
    IconComponent: ShoppingCart, // Using ShoppingCart as a placeholder for production/settings
  },
  {
    stepNumber: 4,
    title: "Fast Delivery",
    description: "Your custom items are carefully packaged and shipped directly to you.",
    IconComponent: Truck,
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-16">
          Getting Your Custom Prints is Easy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <HowItWorksStep
              key={step.stepNumber}
              stepNumber={step.stepNumber}
              title={step.title}
              description={step.description}
              IconComponent={step.IconComponent}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
