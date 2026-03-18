"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useUserCars } from "@/hooks/useCars";
import { CarCard } from "@/components/cars/CarCard";
import { AddCarForm } from "@/components/cars/AddCarForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CarIcon, PlusIcon } from "@phosphor-icons/react";

export default function GaragePage() {
  const { profile }    = useAuthStore();
  const { cars, isLoading } = useUserCars(profile?.id ?? null);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Garage</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your vehicles.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusIcon className="size-4" />
              Add car
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add a car</DialogTitle>
            </DialogHeader>
            <AddCarForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cars grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : cars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
          <CarIcon className="size-12 mb-4 opacity-30" />
          <p className="font-medium">No cars in your garage</p>
          <p className="text-sm mt-1">Add your first car to get started.</p>
          <Button size="sm" className="mt-4" onClick={() => setOpen(true)}>
            <PlusIcon className="size-4" />
            Add your first car
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}