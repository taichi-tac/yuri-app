import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.appSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

// パスワード認証: DBのADMIN_PASSWORD → envのADMIN_PASSWORD → デフォルト "yuri-admin" の順で照合
export async function checkAdminAuth(req: NextRequest): Promise<boolean> {
  const pwd = req.headers.get("x-admin-password");
  if (!pwd) return false;
  const dbPassword = await getSetting("ADMIN_PASSWORD");
  const expected = dbPassword ?? process.env.ADMIN_PASSWORD ?? "yuri-admin";
  return pwd === expected;
}

export function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
