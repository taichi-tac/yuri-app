import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth, setSetting, unauthorized } from "@/lib/settings";

// POST: 管理者パスワード変更
export async function POST(req: NextRequest) {
  if (!await checkAdminAuth(req)) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body?.newPassword || typeof body.newPassword !== "string") {
    return NextResponse.json({ error: "newPassword is required" }, { status: 400 });
  }
  const newPwd = body.newPassword.trim();
  if (newPwd.length < 6) {
    return NextResponse.json({ error: "パスワードは6文字以上にしてください" }, { status: 400 });
  }

  await setSetting("ADMIN_PASSWORD", newPwd);
  return NextResponse.json({ ok: true });
}
