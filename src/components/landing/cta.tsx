"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/shared/link-button";
import { FadeIn } from "@/components/shared/motion";

export function CTA() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-8 py-16 text-center md:px-16 md:py-20">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-0 left-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Ready to shorten smarter?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Join thousands of teams using Linkly to create, manage, and
                analyze their links. Free to start, no credit card required.
              </p>
              <LinkButton href="/register" size="lg" className="mt-8 h-12 px-8">
                Get started for free
                <ArrowRight className="ml-2 size-4" />
              </LinkButton>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
