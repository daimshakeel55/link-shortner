"use client";

export function GlowBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="mesh-bg relative min-h-full flex-1">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 size-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl" />
        <div
          className="absolute top-1/3 -right-20 size-80 rounded-full bg-cyan-500/10 blur-3xl"
          style={{ animation: "pulse 4s ease-in-out infinite" }}
        />
        <div
          className="absolute -bottom-20 left-1/3 size-72 rounded-full bg-pink-500/8 blur-3xl"
          style={{ animation: "pulse 5s ease-in-out infinite" }}
        />
      </div>
      <div className="relative z-0">{children}</div>
    </div>
  );
}
