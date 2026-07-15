import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { DEMO_COOKIE } from "@/lib/demo-store";

const protectedPrefixes = [
  "/dashboard",
  "/api/links",
  "/api/analytics",
  "/api/account",
  "/api/qr",
];

const authPrefixes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function hasDemoSession(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  return cookie.includes(`${DEMO_COOKIE}=demo_`);
}

export default async function proxy(request: NextRequest) {
  try {
    const { pathname, searchParams } = request.nextUrl;

    // Supabase magic-link emails may land on Site URL root with ?code=
    if (pathname === "/" && searchParams.has("code")) {
      const callbackUrl = new URL("/auth/callback", request.url);
      searchParams.forEach((value, key) => {
        callbackUrl.searchParams.set(key, value);
      });
      return NextResponse.redirect(callbackUrl);
    }

    // Supabase auth errors (expired link, etc.) on Site URL root
    if (pathname === "/" && searchParams.has("error")) {
      const message =
        searchParams.get("error_description") ??
        searchParams.get("error_code") ??
        searchParams.get("error") ??
        "Authentication failed";
      const registerUrl = new URL("/register", request.url);
      registerUrl.searchParams.set("error", message);
      return NextResponse.redirect(registerUrl);
    }

    const { supabaseResponse, user } = await updateSession(request);
    const isAuthenticated = Boolean(user) || hasDemoSession(request);

    if (matchesPrefix(pathname, protectedPrefixes) && !isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (matchesPrefix(pathname, authPrefixes) && user) {
      const redirectParam = request.nextUrl.searchParams.get("redirect");
      const destination =
        redirectParam?.startsWith("/") && !redirectParam.startsWith("//")
          ? redirectParam
          : "/dashboard";
      return NextResponse.redirect(new URL(destination, request.url));
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Proxy middleware failed:", error);
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
