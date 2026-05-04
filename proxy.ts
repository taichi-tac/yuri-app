import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function proxy(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  // 未ログインならログイン画面へ
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // 管理者専用ページ（/admin/*）は isAdmin チェック
  if (pathname.startsWith("/admin")) {
    const isAdmin = (session.user as { isAdmin?: boolean })?.isAdmin;
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|api/admin|_next/static|_next/image|favicon.ico|login|admin).*)",
  ],
};
