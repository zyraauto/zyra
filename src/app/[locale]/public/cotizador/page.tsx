import { QuoterStepper } from "@/components/quoter/QuoterStepper";
import { QuoterContainer } from "@/components/quoter/QuoterContainer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get a Quote",
  description: "Get an instant quote for your vehicle service.",
};

export default function QuoterPage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Get a quote</h1>
          <p className="mt-2 text-muted-foreground">
            Select your vehicle and service to see an instant estimate.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <QuoterStepper />
        </div>

        {/* Step content */}
        <QuoterContainer />
      </div>
    </main>
  );
}