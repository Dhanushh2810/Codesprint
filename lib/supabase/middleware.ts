import { NextResponse, type NextRequest } from "next/server";

export function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const hasSession = Boolean(request.cookies.get("codesprint_session")?.value);
  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/practice") ||
    pathname.startsWith("/problems/") ||
    pathname.startsWith("/submissions") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/targets") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/admin");

  if (!hasSession && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (hasSession && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
