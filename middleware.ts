import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async (req) => {
    const isAuth = !!req.nextauth.token;
    console.log("token:",req.nextauth.token);

    // Exclude NextAuth API routes entirely
    if (req.nextUrl.pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    // Public login page
    if (req.nextUrl.pathname === "/") {
      return isAuth
        ? NextResponse.redirect(new URL("/dashboard", req.url))
        : NextResponse.next();
    }

    // Block /dashboard/* if not authenticated
    if (!isAuth && req.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Role-based example: send patients to their sub-dashboard
    if (
      isAuth &&
      req.nextauth.token?.role === "PATIENT" &&
      req.nextUrl.pathname.startsWith("/dashboard") &&
      !req.nextUrl.pathname.startsWith("/dashboard/patient")
    ) {
      return NextResponse.redirect(new URL("/dashboard/patient", req.url));
    }

    return NextResponse.next();
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
