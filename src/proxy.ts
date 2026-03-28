import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authority = request.cookies.get("authority")?.value;

  const isAdminRoute = pathname.startsWith("/admin");
  const isWorkerRoute = pathname.startsWith("/worker");

  if (!authority && (isAdminRoute || isWorkerRoute)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (authority) {
    if (isAdminRoute && authority !== "ADMIN") {
      return NextResponse.redirect(new URL("/worker/my-schedule", request.url));
    }
    if (isWorkerRoute && authority !== "USER") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/worker/:path*"],
};