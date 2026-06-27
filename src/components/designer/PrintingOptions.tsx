import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, Info } from "lucide-react";
import { toast } from "sonner";

interface PrintingOptionsProps {
  onPrintingMethodSelect?: (method: string) => void;
}

export const PrintingOptions: React.FC<PrintingOptionsProps> = ({ onPrintingMethodSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("dtg");

  const printingMethods = [
    {
      id: "dtg",
      name: "DTG Printing",
      description: "Direct-to-Garment printing for detailed, full-color designs",
      features: ["High detail", "Full color", "Soft feel", "Best for cotton"],
      price: "From $12.99",
    },
    {
      id: "nocut",
      name: "No Cut Printing",
      description: "Heat transfer vinyl application without cutting",
      features: ["Durable", "Vibrant colors", "Multiple finishes", "Works on various fabrics"],
      price: "From $8.99",
    },
    {
      id: "embroidery",
      name: "Embroidery",
      description: "Traditional thread embroidery for a premium look",
      features: ["Premium quality", "Long-lasting", "Professional look", "Text and simple designs"],
      price: "From $15.99",
    },
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const confirmSelection = () => {
    const method = printingMethods.find((m) => m.id === selectedMethod);
    if (method && onPrintingMethodSelect) {
      onPrintingMethodSelect(selectedMethod);
      toast.success(`${method.name} selected for your design!`);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Printer className="h-4 w-4" />
          Printing Options
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Printing Method</DialogTitle>
        </DialogHeader>

        <RadioGroup value={selectedMethod} onValueChange={handleMethodSelect} className="space-y-4">
          {printingMethods.map((method) => (
            <div key={method.id} className="flex items-start space-x-3">
              <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
              <Card className="flex-1 cursor-pointer" onClick={() => handleMethodSelect(method.id)}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{method.name}</CardTitle>
                    <span className="text-sm font-semibold text-primary">{method.price}</span>
                  </div>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {method.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </RadioGroup>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Need help choosing?</p>
              <p>
                DTG is best for detailed, colorful designs. No Cut works great for simple graphics
                and text. Embroidery provides the most premium feel for text and simple logos.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={confirmSelection} className="flex-1">
            Select {printingMethods.find((m) => m.id === selectedMethod)?.name}
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
