import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;
  if (!session?.user?.id || !isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isAdmin: true,
      createdAt: true,
      histories: {
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          originalText: true,
          correctedText: true,
          level: true,
          pointsJson: true,
          hasImage: true,
          createdAt: true,
        },
      },
    },
  });

  const result = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    histories: u.histories.map((h) => ({
      ...h,
      points: JSON.parse(h.pointsJson),
      createdAt: h.createdAt.toISOString(),
    })),
  }));

  return NextResponse.json(result);
}
