import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "yuri-admin";

function checkAuth(req: NextRequest): boolean {
  const pwd = req.headers.get("x-admin-password");
  console.log("[auth] received pwd:", JSON.stringify(pwd), "expected:", JSON.stringify(ADMIN_PASSWORD));
  return !!pwd && pwd === ADMIN_PASSWORD;
}

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function detectPlatform(url: string | null): string {
  if (!url) return "other";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("loom.com")) return "loom";
  if (url.includes("zoom.us")) return "zoom";
  return "other";
}

// GET: 動画一覧
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const videos = await prisma.video.findMany({
    orderBy: [{ priority: "asc" }, { sheet: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(videos);
}

// POST: 動画追加
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!body || !body.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const video = await prisma.video.create({
    data: {
      title: body.title.trim(),
      videoUrl: body.videoUrl?.trim() || null,
      materialUrl: body.materialUrl?.trim() || null,
      platform: detectPlatform(body.videoUrl?.trim() || null),
      sheet: body.sheet?.trim() || "その他",
      grammarCategory: body.grammarCategory?.trim() || null,
      priority: body.grammarCategory ? 1 : 2,
      keywords: JSON.stringify(
        body.title.trim().split(/[\s・、,]+/).filter(Boolean)
      ),
    },
  });
  return NextResponse.json(video);
}

// DELETE: 動画削除
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const { id } = await req.json().catch(() => ({}));
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  await prisma.video.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// PATCH: 動画更新
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!body?.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const { id, ...data } = body;
  const video = await prisma.video.update({
    where: { id },
    data: {
      title: data.title?.trim(),
      videoUrl: data.videoUrl?.trim() || null,
      materialUrl: data.materialUrl?.trim() || null,
      platform: detectPlatform(data.videoUrl?.trim() || null),
      sheet: data.sheet?.trim() || "その他",
      grammarCategory: data.grammarCategory?.trim() || null,
      priority: data.grammarCategory?.trim() ? 1 : 2,
    },
  });
  return NextResponse.json(video);
}
