"use client";

import { Check } from "lucide-react";
import { PRICING_PLANS } from "@/lib/constants";
import { LinkButton } from "@/components/shared/link-button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn>
          <div className="text-center">
            <p className="text-sm font-medium text-primary">Pricing</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Start free, upgrade when you need more. No hidden fees.
            </p>
          </div>
        </FadeIn>

        <StaggerContainer className="mt-16 grid gap-6 md:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <StaggerItem key={plan.name}>
              <div
                className={cn(
                  "smooth-hover relative flex h-full flex-col rounded-2xl border p-8 hover:-translate-y-1",
                  plan.highlighted
                    ? "border-primary/50 bg-card shadow-lg shadow-primary/5"
                    : "border-border bg-card hover:border-primary/20"
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-medium">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold">{plan.price}</span>
                  {plan.period !== "contact us" && (
                    <span className="text-sm text-muted-foreground">
                      /{plan.period}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <LinkButton
                  className="mt-8 w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  href="/register"
                >
                  {plan.cta}
                </LinkButton>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
