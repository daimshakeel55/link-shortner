"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LinkPreviewProps {
  destinationUrl: string;
  slug: string;
}

function displayDestination(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    return host + (path === "/" ? "" : path);
  } catch {
    return url.replace(/^https?:\/\//i, "");
  }
}

function AdSlot({ label = "Advertisement" }: { label?: string }) {
  return (
    <div className="flex min-h-[90px] w-full items-center justify-center rounded-xl border border-dashed border-primary/25 bg-card/40 px-6 py-4">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

const COUNTDOWN_SECONDS = 5;

export function LinkPreview({ destinationUrl, slug }: LinkPreviewProps) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const canContinue = secondsLeft === 0 && !isRedirecting;
  const displayUrl = displayDestination(destinationUrl);

  const goToDestination = useCallback(() => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    window.location.assign(destinationUrl);
  }, [destinationUrl, isRedirecting]);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const statusText = isRedirecting
    ? "Redirecting you now..."
    : canContinue
      ? "Click the button below to continue to your destination."
      : `Please wait ${secondsLeft} second${secondsLeft === 1 ? "" : "s"} before continuing...`;

  return (
    <div className="mesh-bg flex min-h-screen flex-col">
      <header className="border-b border-border/60 px-6 py-4">
        <Logo />
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-8">
        <AdSlot />

        <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-lg md:p-8">
          <p className="text-center text-sm text-muted-foreground">
            Here&apos;s a preview of your destination
          </p>

          <div className="mt-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">Destination:</p>
            <p className="mt-2 break-all text-xl font-semibold text-primary md:text-2xl">
              {displayUrl}
            </p>
          </div>

          <p className="mx-auto mt-6 max-w-lg text-center text-sm leading-relaxed text-muted-foreground">
            We&apos;re sending you to an external site. Review the destination above
            before continuing — {APP_NAME} helps you know where links go before you
            arrive.
          </p>

          <div className="mt-8 rounded-xl border border-border/50 bg-background/50 p-5">
            <p className="text-sm font-medium">Security check</p>
            <ul className="mt-4 space-y-3">
              {[
                { icon: Globe, text: `Scanned by ${APP_NAME}` },
                { icon: Shield, text: "Links monitored for suspicious behavior" },
                { icon: CheckCircle2, text: "No threats detected at this time" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Icon className="size-4 shrink-0 text-primary" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <Button
            size="lg"
            className={cn(
              "glow-btn btn-brand mt-8 h-12 w-full text-base",
              !canContinue && "pointer-events-none opacity-50"
            )}
            disabled={!canContinue}
            onClick={goToDestination}
          >
            Continue to destination
            <ArrowRight className="ml-2 size-4" />
          </Button>

          <p className="mt-4 text-center text-sm text-muted-foreground">{statusText}</p>
        </div>

        <AdSlot label="Sponsored content" />
      </main>

      <footer className="mt-auto border-t border-border/60 bg-card/60 px-6 py-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-2xl font-semibold text-gradient-vibrant md:text-3xl">
            This preview is powered by {APP_NAME}
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {APP_NAME} is dedicated to making the internet a safer place for everyone.
            Use the site preview above to make sure the link takes you where you expect.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">/{slug}</p>
        </div>
      </footer>
    </div>
  );
}
