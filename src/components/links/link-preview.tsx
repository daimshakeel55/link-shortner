"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
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

function BannerAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    (window as unknown as { atOptions: Record<string, unknown> }).atOptions = {
      key: "24bad21b4aef70d3dce21986be02ee00",
      format: "iframe",
      height: 90,
      width: 728,
      params: {},
    };

    const script = document.createElement("script");
    script.src =
      "https://www.highperformanceformat.com/24bad21b4aef70d3dce21986be02ee00/invoke.js";
    script.async = true;
    container.appendChild(script);

    return () => {
      script.remove();
      container.replaceChildren();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="mx-auto flex w-full max-w-[728px] items-center justify-center overflow-x-auto"
    />
  );
}

const COUNTDOWN_SECONDS = 5;

export function LinkPreview({ destinationUrl }: LinkPreviewProps) {
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
      <Script
        src="https://pl27693567.effectivecpmnetwork.com/cd/3f/fe/cd3ffe0bd3e021b13c29efaf91048401.js"
        strategy="afterInteractive"
      />
      <header className="border-b border-border/60 px-6 py-4">
        <Logo />
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-8">
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

        <BannerAd />
      </main>
    </div>
  );
}
