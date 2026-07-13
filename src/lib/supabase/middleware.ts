import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/config";
import { DEMO_COOKIE } from "@/lib/demo-store";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value, cookie);
  });
}

function handleRouteGuards(
  request: NextRequest,
  isAuthenticated: boolean
): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (isDashboardRoute && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return null;
}

async function isUserAuthenticated(
  supabase: ReturnType<typeof createServerClient<Database>>
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return Boolean(user);
}

export async function updateSession(request: NextRequest) {
  const demoUserId = request.cookies.get(DEMO_COOKIE)?.value;
  const hasDemoSession = Boolean(demoUserId?.startsWith("demo_"));

  if (!isSupabaseConfigured()) {
    const redirect = handleRouteGuards(request, hasDemoSession);
    return redirect ?? NextResponse.next({ request });
  }

  const { url, anonKey } = getSupabaseEnv();
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const hasSupabaseSession = await isUserAuthenticated(supabase);
  const isAuthenticated = hasSupabaseSession || hasDemoSession;

  const redirect = handleRouteGuards(request, isAuthenticated);
  if (redirect) {
    copyCookies(supabaseResponse, redirect);
    return redirect;
  }

  return supabaseResponse;
}
