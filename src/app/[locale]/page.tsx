import { redirect } from "next/navigation";

export default function LocaleRootPage() {
  redirect("/public");
  // Next.js nunca llega aquí pero satisface el tipo de retorno
}