import { Navbar } from "@/components/landing/navbar";
import { AuthHashErrorHandler } from "@/components/auth/auth-hash-error-handler";
import { HomeRedirect } from "@/components/auth/home-redirect";
import { HomeSignedInRedirect } from "@/components/auth/home-signed-in-redirect";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Statistics } from "@/components/landing/statistics";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { JsonLd } from "@/components/shared/json-ld";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSessionUser();

  if (session) {
    return <HomeRedirect />;
  }

  return (
    <main className="mesh-bg min-h-screen">
      <HomeSignedInRedirect />
      <AuthHashErrorHandler />
      <JsonLd />
      <Navbar />
      <Hero />
      <Statistics />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
