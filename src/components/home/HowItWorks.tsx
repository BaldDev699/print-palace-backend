import React from "react";
import HowItWorksStep from "./HowItWorksStep";
import { Lightbulb, Pencil, ShoppingCart, Truck } from "lucide-react"; // Example icons

const steps = [
  { stepNumber: 1, title: "Design It", description: "Pick a product and create your design in our online studio.", IconComponent: Pencil },
  { stepNumber: 2, title: "Manufacturer Reviews", description: "A verified manufacturer checks your design and confirms they can make it.", IconComponent: Lightbulb },
  { stepNumber: 3, title: "Pay & Produce", description: "Pay securely once confirmed and production begins.", IconComponent: ShoppingCart },
  { stepNumber: 4, title: "Delivery", description: "Your custom items are packaged and delivered to you.", IconComponent: Truck },
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
