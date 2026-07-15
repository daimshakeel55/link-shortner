"use client";

export function GlowBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="mesh-bg relative min-h-full flex-1">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 size-96 rounded-full orb-primary blur-3xl" />
        <div className="absolute top-1/3 -right-20 size-80 rounded-full orb-light blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 size-72 rounded-full orb-deep blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(96,165,250,0.8) 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>
      <div className="relative z-0">{children}</div>
    </div>
  );
}
