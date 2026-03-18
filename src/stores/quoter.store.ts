import { create } from "zustand";
import type { CarBrand, CarModel, CarYear, Service, ServicePrice } from "@/types";

type QuoterStep = "brand" | "model" | "year" | "service" | "summary";

type QuoterState = {
  // Step tracking
  step: QuoterStep;
  // Selections
  brand: CarBrand | null;
  model: CarModel | null;
  year: CarYear | null;
  service: Service | null;
  price: ServicePrice | null;
  // Workshop preference
  workshopId: string | null;
  // Actions
  setBrand: (brand: CarBrand) => void;
  setModel: (model: CarModel) => void;
  setYear: (year: CarYear) => void;
  setService: (service: Service) => void;
  setPrice: (price: ServicePrice) => void;
  setWorkshop: (id: string) => void;
  goToStep: (step: QuoterStep) => void;
  reset: () => void;
};

const INITIAL_STATE = {
  step: "brand" as QuoterStep,
  brand: null,
  model: null,
  year: null,
  service: null,
  price: null,
  workshopId: null,
};

export const useQuoterStore = create<QuoterState>((set) => ({
  ...INITIAL_STATE,

  setBrand: (brand) =>
    set({ brand, model: null, year: null, service: null, price: null, step: "model" }),

  setModel: (model) =>
    set({ model, year: null, service: null, price: null, step: "year" }),

  setYear: (year) =>
    set({ year, service: null, price: null, step: "service" }),

  setService: (service) =>
    set({ service, price: null, step: "summary" }),

  setPrice: (price) =>
    set({ price }),

  setWorkshop: (id) =>
    set({ workshopId: id }),

  goToStep: (step) => set({ step }),

  reset: () => set(INITIAL_STATE),
}));

// Derived selector — ready to book
export const selectQuoterIsComplete = (s: QuoterState) =>
  !!(s.brand && s.model && s.year && s.service && s.price);