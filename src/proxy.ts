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
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;
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
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
