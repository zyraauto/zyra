import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | AutoService Pro",
    default:  "Auth",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-svh bg-muted/40">
      {children}
    </main>
  );
}