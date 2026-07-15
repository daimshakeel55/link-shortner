"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Link2, BarChart3, Shield } from "lucide-react";
import { Logo } from "@/components/shared/logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const highlights = [
  { icon: Link2, text: "Shorten any URL in one click" },
  { icon: BarChart3, text: "Track clicks and analytics" },
  { icon: Shield, text: "Password protect sensitive links" },
];

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-primary/15 bg-card/50 p-10 lg:flex">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/2 size-[500px] -translate-x-1/2 rounded-full orb-primary blur-3xl" />
          <div className="absolute bottom-1/4 right-0 size-[300px] rounded-full orb-light blur-3xl" />
          <div className="absolute top-2/3 left-0 size-[200px] rounded-full orb-deep blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <Logo />

        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">
              <span className="text-gradient-vibrant">Short links.</span>
              <br />
              <span className="text-muted-foreground">Deep insights.</span>
            </h2>
            <p className="mt-4 max-w-sm text-muted-foreground">
              Create branded short links, track every click, and manage your
              URLs from one place.
            </p>
          </div>

          <ul className="space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/30">
                  <Icon className="size-4 text-primary" />
                </div>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-muted-foreground">
          Trusted by teams worldwide
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8 lg:hidden">
          <Logo className="justify-center" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              ← Back to home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
