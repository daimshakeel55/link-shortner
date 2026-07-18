export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "SharkVault";

function resolveAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const productionDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionDomain) {
    const host = productionDomain.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }

  return "http://localhost:3000";
}

export const APP_URL = resolveAppUrl();

export const RESERVED_SLUGS = [
  "api",
  "auth",
  "login",
  "register",
  "dashboard",
  "settings",
  "analytics",
  "links",
  "forgot-password",
  "reset-password",
  "verify-email",
  "pricing",
  "about",
  "blog",
  "docs",
  "help",
  "support",
  "terms",
  "privacy",
  "admin",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
] as const;

export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 64;

export const DEFAULT_PAGE_SIZE = 10;

export const PRICING_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "50 links",
      "Basic analytics",
      "QR codes",
      "Custom slugs",
      "Link expiration",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For professionals and teams",
    features: [
      "Unlimited links",
      "Advanced analytics",
      "Password protection",
      "Custom domains",
      "API access",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "SSO & SAML",
      "Dedicated support",
      "SLA guarantee",
      "Custom integrations",
      "Volume discounts",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: `How does ${APP_NAME} work?`,
    answer:
      "Paste your long URL, customize your short link, and share it anywhere. We handle redirects, analytics, and security in the background.",
  },
  {
    question: "Can I use a custom domain?",
    answer:
      "Yes. Pro and Enterprise plans let you connect your own domain so links match your brand.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. The free plan includes 50 links, basic analytics, QR codes, and custom slugs — no credit card required.",
  },
  {
    question: "How secure are my links?",
    answer:
      "All links are served over HTTPS. You can password-protect links, set expiration dates, and disable them at any time.",
  },
  {
    question: "What analytics do you provide?",
    answer:
      "Track clicks, unique visitors, geographic data, devices, browsers, operating systems, and referrers with daily, weekly, and monthly views.",
  },
  {
    question: "Can I export my data?",
    answer:
      "Pro users can export link and analytics data via the dashboard or our REST API.",
  },
] as const;

export const FEATURES = [
  {
    title: "Lightning Fast",
    description:
      "Sub-50ms redirects globally with edge caching and optimized infrastructure.",
    icon: "Zap" as const,
  },
  {
    title: "Deep Analytics",
    description:
      "Track every click with geographic, device, and referrer insights in real time.",
    icon: "BarChart3" as const,
  },
  {
    title: "Custom Slugs",
    description:
      "Create memorable, branded short links that reflect your identity.",
    icon: "Link2" as const,
  },
  {
    title: "QR Codes",
    description:
      "Generate downloadable QR codes for any link — perfect for print and events.",
    icon: "QrCode" as const,
  },
  {
    title: "Password Protection",
    description:
      "Secure sensitive links with password protection and expiration dates.",
    icon: "Shield" as const,
  },
  {
    title: "API Access",
    description:
      "Integrate link creation and analytics into your workflow with our REST API.",
    icon: "Code2" as const,
  },
] as const;

export const STATS = [
  { value: "10M+", label: "Links Created" },
  { value: "500M+", label: "Clicks Tracked" },
  { value: "99.99%", label: "Uptime SLA" },
  { value: "150+", label: "Countries Served" },
] as const;
