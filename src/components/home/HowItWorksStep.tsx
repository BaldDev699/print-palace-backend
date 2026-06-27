import React from "react";
import { LucideProps } from "lucide-react";

interface HowItWorksStepProps {
  stepNumber: number;
  title: string;
  description: string;
  IconComponent: React.ComponentType<LucideProps>;
}

const HowItWorksStep: React.FC<HowItWorksStepProps> = ({
  stepNumber,
  title,
  description,
  IconComponent,
}) => {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md">
      <div className="bg-primary text-primary-foreground rounded-full p-4 mb-6 inline-flex">
        <IconComponent size={32} />
      </div>
      <div className="mb-2 text-sm font-semibold text-primary">STEP {stepNumber}</div>
      <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default HowItWorksStep;
