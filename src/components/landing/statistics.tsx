"use client";

import { STATS } from "@/lib/constants";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/motion";

export function Statistics() {
  return (
    <section className="border-y border-border bg-card/30 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <StaggerContainer className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="text-center">
                <p className="text-3xl font-semibold tracking-tight md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
