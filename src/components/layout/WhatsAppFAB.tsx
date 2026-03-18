"use client";

import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type Props = {
  phoneNumber: string;  // e.g. "521234567890"
  message?: string;
  className?: string;
};

export function WhatsAppFAB({ phoneNumber, message = "Hello! I need help.", className }: Props) {
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "flex items-center justify-center",
        "w-14 h-14 rounded-full shadow-lg",
        "bg-[#25D366] text-white",
        "hover:scale-110 transition-transform duration-200",
        className
      )}
    >
      <WhatsappLogoIcon weight="fill" className="w-7 h-7" />
    </a>
  );
}