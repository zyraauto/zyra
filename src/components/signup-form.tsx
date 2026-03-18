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

type SignupValues = {
  full_name:        string;
  email:            string;
  password:         string;
  confirm_password: string;
};

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const router  = useRouter();
  const locale  = useLocale();                          // ✅ dentro del componente

  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading,           setIsLoading]           = useState(false);
  const [isGoogleLoading,     setIsGoogleLoading]     = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupValues>({
    defaultValues: {
      full_name:        "",
      email:            "",
      password:         "",
      confirm_password: "",
    },
  });

  const passwordValue = watch("password");

  const onSubmit = async ({ email, password, full_name }: SignupValues) => {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data:            { full_name },
        emailRedirectTo: `${window.location.origin}/${locale}/auth/callback`, // ✅
      },
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success("Account created! Check your email to confirm.");
    router.push(`/${locale}/auth/login?registered=true`);                    // ✅
    setIsLoading(false);
  };

  const signUpWithGoogle = async () => {
    setIsGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/${locale}/auth/callback`,     // ✅
      },
    });
    setIsGoogleLoading(false);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="flex flex-col gap-5">

              <div className="flex flex-col items-center gap-2 text-center">
                <CarIcon weight="fill" className="size-8 text-primary" />
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-sm text-muted-foreground">
                  Join AutoService Pro today
                </p>
              </div>

              {/* Full name */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  {...register("full_name", {
                    required:  "Name is required",
                    minLength: { value: 2, message: "Name must be at least 2 characters" },
                  })}
                />
                {errors.full_name && (
                  <p className="text-xs text-destructive">{errors.full_name.message}</p>
                )}
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
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("password", {
                      required:  "Password is required",
                      minLength: { value: 8, message: "Password must be at least 8 characters" },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword
                      ? <EyeSlashIcon className="size-4" />
                      : <EyeIcon      className="size-4" />
                    }
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm_password">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("confirm_password", {
                      required: "Please confirm your password",
                      validate: (v) => v === passwordValue || "Passwords do not match",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword
                      ? <EyeSlashIcon className="size-4" />
                      : <EyeIcon      className="size-4" />
                    }
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-xs text-destructive">{errors.confirm_password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account…" : "Create account"}
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
                onClick={signUpWithGoogle}
                disabled={isGoogleLoading}
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                {isGoogleLoading ? "Connecting…" : "Continue with Google"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href={`/${locale}/auth/login`}                             // ✅
                  className="font-medium text-foreground hover:underline underline-offset-2"
                >
                  Sign in
                </Link>
              </p>

            </div>
          </form>

          <div className="relative hidden bg-muted md:flex items-center justify-center p-8">
            <div className="text-center text-muted-foreground">
              <CarIcon weight="fill" className="size-20 mx-auto mb-4 text-primary/30" />
              <p className="text-sm font-medium">Join thousands of drivers</p>
              <p className="text-xs">Book services, track your car, earn points</p>
            </div>
          </div>

        </CardContent>
      </Card>

      <p className="px-6 text-center text-xs text-muted-foreground">
        By creating an account you agree to our{" "}
        <Link
          href={`/${locale}/legal/terminos`}                                 // ✅
          className="underline underline-offset-2 hover:text-foreground"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href={`/${locale}/legal/privacidad`}                              
          className="underline underline-offset-2 hover:text-foreground"
        >
          Privacy Policy
        </Link>.
      </p>
    </div>
  );
}