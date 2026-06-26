
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "How much and how long does it take to deliver?",
    answer: "Delivery costs and times vary depending on your location. We plan to implement a map estimator that will show you the estimated delivery cost and time based on the point you pick. For now, standard shipping usually takes 3-7 business days within the country, and costs are calculated at checkout.",
  },
  {
    question: "What types of products can I customize?",
    answer: "You can customize a wide range of products including t-shirts, hoodies, sweatshirts, caps, mugs, phone cases, posters, and more. Check our 'Products' section for the full list!",
  },
  {
    question: "What file formats do you accept for designs?",
    answer: "We recommend using high-resolution PNG, JPEG, SVG, or PDF files for the best print quality. Our design tool will guide you if your file needs adjustments.",
  },
  {
    question: "Is there a minimum order quantity?",
    answer: "For many of our products, there is no minimum order quantity! You can order just one item if you'd like. We also offer discounts for bulk orders.",
  },
  {
    question: "Can I see a preview of my design before ordering?",
    answer: "Yes! Our online design tool allows you to see a digital mock-up of your design on the product before you place your order.",
  },
];

const FaqSection = () => {
  return (
    <section id="faq" className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Have questions? We've got answers. If you don't find what you're looking for, feel free to contact us.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((item, index) => (
              <AccordionItem value={`item-${index + 1}`} key={index}>
                <AccordionTrigger className="text-left hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
