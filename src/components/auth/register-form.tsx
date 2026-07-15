"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
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
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (needsVerification) {
      verificationForm.reset({ code: "" });
    }
  }, [needsVerification, verificationForm]);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setFormError(error);
      toast.error(error);
    }
  }, [searchParams]);

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

  async function resendVerification() {
    if (!registeredEmail) {
      toast.error("Enter your email on the form below and register again");
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: registeredEmail }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        const message = result.error ?? "Could not resend verification email";
        setFormError(message);
        toast.error(message);
        return;
      }

      toast.success("New verification email sent — use the latest link or code");
    } catch {
      toast.error("Could not resend verification email");
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
          key="verification-step"
          autoComplete="off"
          onSubmit={verificationForm.handleSubmit(onVerify)}
          className="space-y-4"
        >
          <p className="text-sm text-muted-foreground">
            Check your email for a 6-digit code, or click the confirmation link
            in the email to verify automatically.
          </p>
          <div className="space-y-2">
            <Label htmlFor="verification-code">Verification code</Label>
            <Input
              id="verification-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="Enter 6-digit code"
              autoComplete="one-time-code"
              autoCorrect="off"
              spellCheck={false}
              data-1p-ignore
              data-lpignore="true"
              readOnly
              onFocus={(event) => event.currentTarget.removeAttribute("readonly")}
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

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={loading || !registeredEmail}
            onClick={resendVerification}
          >
            Resend verification email
          </Button>
        </form>
      ) : (
        <form autoComplete="on" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      {!needsVerification && formError && (
        <p className="mt-4 text-center text-xs text-destructive">{formError}</p>
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
