"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/shared/logo";
import { LinkButton } from "@/components/shared/link-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import { navigateAfterAuth } from "@/lib/auth/redirect";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [resetEmail, setResetEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const emailForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function sendCode(data: ForgotPasswordInput) {
    setLoading(true);
    setFormError(null);

    try {
      const supabase = createClient();
      const email = data.email.trim();
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        const message = error.message ?? "Could not send reset code";
        setFormError(message);
        toast.error(message);
        return;
      }

      setResetEmail(email);
      resetForm.setValue("code", "");
      setStep("code");
      toast.success("Password reset code sent");
    } catch {
      toast.error("Could not send reset code");
    } finally {
      setLoading(false);
    }
  }

  async function handleCodeStep(e: React.FormEvent) {
    e.preventDefault();
    const code = resetForm.getValues("code").trim();
    if (!code) {
      resetForm.setError("code", { message: "Verification code is required" });
      return;
    }
    await verifyCode({ code });
  }

  async function verifyCode(data: { code: string }) {
    setLoading(true);
    setFormError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email: resetEmail,
        token: data.code.trim(),
        type: "recovery",
      });

      if (error) {
        const message = error.message ?? "Invalid verification code";
        setFormError(message);
        toast.error(message);
        return;
      }

      setStep("password");
    } catch {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function submitNewPassword(data: ResetPasswordInput) {
    setLoading(true);
    setFormError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        const message = error.message ?? "Could not reset password";
        setFormError(message);
        toast.error(message);
        return;
      }

      toast.success("Password updated");
      navigateAfterAuth("/dashboard");
    } catch {
      toast.error("Could not reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === "email"
              ? "Enter your email and we'll send you a reset code"
              : step === "code"
                ? "Enter the verification code from your email"
                : "Choose a new password"}
          </p>
        </div>

        {step === "email" ? (
          <form
            onSubmit={emailForm.handleSubmit(sendCode)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...emailForm.register("email")}
              />
              {emailForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {formError && (
              <p className="text-xs text-destructive">{formError}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Send reset code
            </Button>
          </form>
        ) : (
          <form
            onSubmit={
              step === "code"
                ? handleCodeStep
                : resetForm.handleSubmit(submitNewPassword)
            }
            className="space-y-4"
          >
            {step === "code" && (
              <div className="space-y-2">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  placeholder="Enter code from email"
                  autoComplete="one-time-code"
                  {...resetForm.register("code")}
                />
                {resetForm.formState.errors.code && (
                  <p className="text-xs text-destructive">
                    {resetForm.formState.errors.code.message}
                  </p>
                )}
              </div>
            )}

            {step === "password" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    {...resetForm.register("password")}
                  />
                  {resetForm.formState.errors.password && (
                    <p className="text-xs text-destructive">
                      {resetForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    {...resetForm.register("confirmPassword")}
                  />
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {formError && (
              <p className="text-xs text-destructive">{formError}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {step === "code" ? "Verify code" : "Set new password"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <LinkButton href="/login" variant="ghost" className="w-full">
            <ArrowLeft className="mr-2 size-4" />
            Back to login
          </LinkButton>
        </p>
      </motion.div>
    </div>
  );
}
