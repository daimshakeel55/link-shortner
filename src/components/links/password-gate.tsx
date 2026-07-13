"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { linkPasswordSchema, type LinkPasswordInput } from "@/lib/validations/link";
import { Logo } from "@/components/shared/logo";

interface PasswordGateProps {
  slug: string;
}

export function PasswordGate({ slug }: PasswordGateProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit } = useForm<LinkPasswordInput>({
    resolver: zodResolver(linkPasswordSchema),
  });

  async function onSubmit(data: LinkPasswordInput) {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/verify-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, password: data.password }),
    });

    if (!res.ok) {
      setError("Incorrect password");
      setLoading(false);
      return;
    }

    router.push(`/${slug}?verified=true`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <Logo className="justify-center" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <Lock className="size-6 text-primary" />
              </div>
              <h1 className="mt-4 text-lg font-semibold">Password protected</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                This link requires a password to access
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  autoFocus
                  {...register("password")}
                />
                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
