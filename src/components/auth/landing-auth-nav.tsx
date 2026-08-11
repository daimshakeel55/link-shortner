import { LinkButton } from "@/components/shared/link-button";

export function LandingAuthNav({ variant }: { variant: "desktop" | "mobile" }) {
  const isMobile = variant === "mobile";

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2 pt-2">
        <LinkButton href="/login" variant="outline">
          Log in
        </LinkButton>
        <LinkButton href="/register">Get Started</LinkButton>
      </div>
    );
  }

  return (
    <>
      <LinkButton href="/login" variant="ghost" size="sm">
        Log in
      </LinkButton>
      <LinkButton href="/register" size="sm">
        Get Started
      </LinkButton>
    </>
  );
}
