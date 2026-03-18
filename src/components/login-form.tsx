"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useLocale } from "next-intl";
import { z } from "zod";
import { toast } from "sonner";
import { EyeIcon, EyeSlashIcon, CarIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Tables } from "@/types/database";

const LoginSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof LoginSchema>;
type ProfileRow  = Tables<"profiles">;

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const locale = useLocale();                  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async ({ email, password }: LoginValues) => {
    const parsed = LoginSchema.safeParse({ email, password });
    if (!parsed.success) return;

    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "Incorrect email or password"
          : error.message
      );
      setIsLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const profile = profileData as Pick<ProfileRow, "role"> | null;

      const roleMap: Record<string, string> = {
        super_admin:    `/${locale}/admin/dashboard`,
        workshop_admin: `/${locale}/workshop/dashboard`,
        mechanic:       `/${locale}/mechanic/mis-citas`,
        client:         `/${locale}/client/dashboard`,
        supplier:       `/${locale}/supplier/ordenes`,
        visitor:        `/${locale}/public`,
      };

const destination = roleMap[profile?.role ?? ""] ?? `/${locale}/client/dashboard`;

      router.push(destination);
      router.refresh();
    }

    setIsLoading(false);
  };

  const signInWithGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {                                 // ✅ dentro de options
        redirectTo: `${window.location.origin}/${locale}/auth/callback`,
      },
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">

              <div className="flex flex-col items-center gap-2 text-center">
                <CarIcon weight="fill" className="size-8 text-primary" />
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-sm text-muted-foreground">
                  Sign in to your AutoService Pro account
                </p>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register("email", {
                    required: "Email is required",
                    validate: (v) => {
                      const r = z.string().email().safeParse(v);
                      return r.success || "Invalid email address";
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href={`/${locale}/auth/recuperar`}  // ✅ con locale
                    className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Password must be at least 6 characters" },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword
                      ? <EyeSlashIcon className="size-4" />
                      : <EyeIcon className="size-4" />
                    }
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={signInWithGoogle}
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Continue with Google
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href={`/${locale}/auth/registro`}   // ✅ con locale
                  className="font-medium text-foreground hover:underline underline-offset-2"
                >
                  Sign up
                </Link>
              </p>

            </div>
          </form>

          <div className="relative hidden bg-muted md:flex items-center justify-center p-8">
            <div className="text-center text-muted-foreground">
              <CarIcon weight="fill" className="size-20 mx-auto mb-4 text-primary/30" />
              <p className="text-sm font-medium">Your trusted workshop</p>
              <p className="text-xs">Always nearby, always ready</p>
            </div>
          </div>

        </CardContent>
      </Card>

      <p className="px-6 text-center text-xs text-muted-foreground">
        By signing in you agree to our{" "}
        <Link
          href={`/${locale}/legal/terminos`}          // ✅ con locale
          className="underline underline-offset-2 hover:text-foreground"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href={`/${locale}/legal/privacidad`}        // ✅ con locale
          className="underline underline-offset-2 hover:text-foreground"
        >
          Privacy Policy
        </Link>.
      </p>
    </div>
  );
}