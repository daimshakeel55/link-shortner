"use client";

import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/motion";

const steps = [
  {
    step: "01",
    title: "Paste your URL",
    description:
      "Enter any long URL you want to shorten. We support all standard web protocols.",
  },
  {
    step: "02",
    title: "Customize your link",
    description:
      "Choose a custom slug, set expiration, add password protection, or generate a QR code.",
  },
  {
    step: "03",
    title: "Share and track",
    description:
      "Share your short link anywhere and monitor clicks, visitors, and engagement in real time.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn>
          <div className="text-center">
            <p className="text-sm font-medium text-primary">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Three steps to smarter links
            </h2>
          </div>
        </FadeIn>

        <StaggerContainer className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <StaggerItem key={item.step}>
              <div className="relative">
                <span className="text-5xl font-bold text-primary/10">
                  {item.step}
                </span>
                <h3 className="mt-4 text-xl font-medium">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
