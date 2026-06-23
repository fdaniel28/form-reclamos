import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const proto = request.headers.get("x-forwarded-proto");

  // HTTP→HTTPS redirect is handled by nginx (port 80 → 301 → 443).
  // Do NOT redirect here: Next.js standalone injects x-forwarded-proto:http on its own
  // internal requests (e.g. the image optimizer fetching /logo.png), which would cause
  // those requests to redirect to a non-existent HTTPS port on the app container.

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  response.headers.delete("Server");
  response.headers.delete("X-Powered-By");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health).*)"]
};
