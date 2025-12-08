import { NextRequest, NextResponse } from "next/server";
import { addUserHeaders, isAdmin, verifyToken } from "./helpers/auth";

const PUBLIC_ROUTES = ["/login"];
const ADMIN_ROUTES = ["/users"];
const DEFAULT_AUTH_ROUTE = "/dashboard";
const LOGIN_ROUTE = "/login";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permetti accesso alle route pubbliche
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Escludi file statici e API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Verifica presenza del token
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
  }

  // Verifica validità del token
  const user = await verifyToken(accessToken);

  if (!user) {
    const response = NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
    response.cookies.delete("accessToken");
    return response;
  }

  // Controlla permessi admin per route protette
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAdmin(user)) {
      return NextResponse.redirect(new URL(DEFAULT_AUTH_ROUTE, request.url));
    }
  }

  // Permetti accesso con header utente
  const response = NextResponse.next();
  return addUserHeaders(response, user);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
