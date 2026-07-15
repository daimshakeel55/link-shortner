"use client";

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
import {
  emailVerificationSchema,
  registerSchema,
  type EmailVerificationInput,
  type RegisterInput,
} from "@/lib/validations/auth";
import { navigateAfterAuth } from "@/lib/auth/redirect";
import { useAuthenticatedRedirect } from "@/lib/auth/use-authenticated-redirect";

export function RegisterForm() {
  const { isLoaded, isSignedIn, isRedirecting } =
    useAuthenticatedRedirect("/dashboard");
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const verificationForm = useForm<EmailVerificationInput>({
    resolver: zodResolver(emailVerificationSchema),
  });

  if (isLoaded && isSignedIn && isRedirecting) {
    return (
      <AuthLayout
        title="Create your account"
        subtitle="Redirecting to your dashboard..."
      >
        <div className="flex justify-center py-8">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </AuthLayout>
    );
  }

  async function onSubmit(data: RegisterInput) {
    setLoading(true);
    setFormError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as {
        error?: string;
        needsVerification?: boolean;
        email?: string;
      };

      if (!response.ok) {
        const message = result.error ?? "Registration failed";
        setFormError(message);
        toast.error(message);
        return;
      }

      if (result.needsVerification) {
        setRegisteredEmail(result.email ?? data.email.trim());
        setNeedsVerification(true);
        toast.success("Check your email for a verification code");
        return;
      }

      toast.success("Account created!");
      navigateAfterAuth("/dashboard");
    } catch {
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(data: EmailVerificationInput) {
    setLoading(true);
    setFormError(null);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: registeredEmail,
          code: data.code.trim(),
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        const message = result.error ?? "Invalid verification code";
        setFormError(message);
        toast.error(message);
        return;
      }

      toast.success("Account created!");
      navigateAfterAuth("/dashboard");
    } catch {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start shortening links in seconds"
    >
      {needsVerification ? (
        <form
          onSubmit={verificationForm.handleSubmit(onVerify)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              placeholder="Enter 6-digit code"
              autoComplete="one-time-code"
              {...verificationForm.register("code")}
            />
            {verificationForm.formState.errors.code && (
              <p className="text-xs text-destructive">
                {verificationForm.formState.errors.code.message}
              </p>
            )}
          </div>

          {formError && (
            <p className="text-xs text-destructive">{formError}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Verify email
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              autoComplete="name"
              {...register("fullName")}
            />
            {formErrors.fullName && (
              <p className="text-xs text-destructive">
                {formErrors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="johndoe"
              autoComplete="username"
              {...register("username")}
            />
            {formErrors.username && (
              <p className="text-xs text-destructive">
                {formErrors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
            />
            {formErrors.email && (
              <p className="text-xs text-destructive">
                {formErrors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("password")}
            />
            {formErrors.password && (
              <p className="text-xs text-destructive">
                {formErrors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {formErrors.confirmPassword && (
              <p className="text-xs text-destructive">
                {formErrors.confirmPassword.message}
              </p>
            )}
          </div>

          {formError && (
            <p className="text-xs text-destructive">{formError}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Create account
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>

      <DemoButton />
    </AuthLayout>
  );
}
