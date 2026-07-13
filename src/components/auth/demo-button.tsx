"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function DemoButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function enterDemo() {
    const res = await fetch("/api/demo/login", { method: "POST" });
    if (!res.ok) {
      toast.error("Could not start demo");
      return;
    }
    toast.success("Welcome to demo mode!");
    window.location.href = "/dashboard";
  }

  if (!mounted || isSupabaseConfigured()) return null;

  return (
    <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center">
      <p className="text-xs text-muted-foreground">
        No Supabase configured yet. Try the app instantly:
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-3 w-full"
        onClick={enterDemo}
      >
        Continue in demo mode
      </Button>
    </div>
  );
}
