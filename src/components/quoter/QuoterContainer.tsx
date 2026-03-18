"use client";

import { useQuoterStore } from "@/stores/quoter.store";
import { CarSelector } from "./CarSelector";
import { ServicePicker } from "./ServicePicker";
import { QuoteSummary } from "./QuoteSummary";
import { Card, CardContent } from "@/components/ui/card";

export function QuoterContainer() {
  const { step } = useQuoterStore();

  const renderStep = () => {
    switch (step) {
      case "brand":
      case "model":
      case "year":
        return <CarSelector />;
      case "service":
        return <ServicePicker />;
      case "summary":
        return <QuoteSummary />;
      default:
        return <CarSelector />;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {renderStep()}
      </CardContent>
    </Card>
  );
}