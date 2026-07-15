"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { LinkButton } from "@/components/shared/link-button";
import { FadeIn } from "@/components/shared/motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full orb-primary blur-3xl" />
        <div className="absolute top-1/2 right-0 size-[400px] translate-x-1/2 rounded-full orb-light blur-3xl" />
        <div className="absolute bottom-0 left-1/4 size-[300px] rounded-full orb-deep blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <FadeIn>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground"
          >
            <Sparkles className="size-3.5 text-primary" />
            Premium link management for modern teams
          </motion.div>
        </FadeIn>

        <FadeIn delay={1}>
          <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
            <span className="text-gradient-vibrant">Short links.</span>
            <br />
            <span className="text-muted-foreground">Deep insights.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={2}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Create branded short links, track every click, and manage your URLs
            with enterprise-grade analytics. Built for teams who care about
            quality.
          </p>
        </FadeIn>

        <FadeIn delay={3}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <LinkButton href="/register" size="lg" className="glow-btn btn-brand h-12 px-8 text-base">
              Start for free
              <ArrowRight className="ml-2 size-4" />
            </LinkButton>
            <LinkButton
              href="#features"
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base"
            >
              See features
            </LinkButton>
          </div>
        </FadeIn>

        <FadeIn delay={4}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="glow mx-auto mt-16 max-w-3xl rounded-2xl border border-primary/25 bg-card/80 p-1 backdrop-blur-sm"
          >
            <div className="rounded-xl bg-background p-6 md:p-8">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-500/60" />
                  <div className="size-3 rounded-full bg-yellow-500/60" />
                  <div className="size-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 rounded-md bg-muted px-4 py-1.5 text-left text-sm text-muted-foreground">
                  linkly.app/dashboard
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  { label: "Total Clicks", value: "24,891" },
                  { label: "Active Links", value: "142" },
                  { label: "Unique Visitors", value: "8,432" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-border bg-card p-4 text-left"
                  >
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}
