"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/auth-layout";
import { DemoButton } from "@/components/auth/demo-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { navigateAfterAuth } from "@/lib/auth/redirect";
import { useAuthenticatedRedirect } from "@/lib/auth/use-authenticated-redirect";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") ?? "/dashboard";
  const redirect =
    redirectParam.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : "/dashboard";
  const { isLoaded, isSignedIn, isRedirecting } =
    useAuthenticatedRedirect(redirect);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    setFormError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as {
        error?: string | { message?: string };
        code?: string;
      };

      if (!response.ok) {
        const message =
          typeof result.error === "string"
            ? result.error
            : result.error?.message ?? "Sign in failed";
        setFormError(message);
        toast.error(message);
        return;
      }

      navigateAfterAuth(redirect);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Sign in failed";
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (isLoaded && isSignedIn && isRedirecting) {
    return (
      <AuthLayout
        title="Welcome back"
        subtitle="Redirecting to your dashboard..."
      >
        <div className="flex justify-center py-8">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email or username</Label>
          <Input
            id="email"
            type="text"
            placeholder="you@example.com"
            autoComplete="username"
            {...register("email")}
          />
          {formErrors.email && (
            <p className="text-xs text-destructive">{formErrors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password")}
          />
          {formErrors.password && (
            <p className="text-xs text-destructive">
              {formErrors.password.message}
            </p>
          )}
        </div>

        {formError && (
          <p className="text-xs text-destructive">{formError}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>

      <DemoButton />
    </AuthLayout>
  );
}
