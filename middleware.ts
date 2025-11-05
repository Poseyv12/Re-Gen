import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Protect /admin (except login) and /studio routes
	const isAdminRoute = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
	const isStudioRoute = pathname.startsWith("/studio");

	if (isAdminRoute || isStudioRoute) {
		const isAdmin = request.cookies.get("admin")?.value === "1";
		if (!isAdmin) {
			const url = request.nextUrl.clone();
			url.pathname = "/admin/login";
			url.searchParams.set("next", pathname);
			return NextResponse.redirect(url);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/admin/:path*", "/studio/:path*"],
};


