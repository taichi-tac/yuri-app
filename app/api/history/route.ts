import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const histories = await prisma.correctionHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      originalText: true,
      correctedText: true,
      level: true,
      pointsJson: true,
      relatedContentIdsJson: true,
      alternativeExpressionsJson: true,
      practiceAdviceJson: true,
      hasImage: true,
      createdAt: true,
    },
  });

  const parsed = histories.map((h) => ({
    ...h,
    points: JSON.parse(h.pointsJson),
    relatedContentIds: JSON.parse(h.relatedContentIdsJson),
    alternativeExpressions: JSON.parse(h.alternativeExpressionsJson),
    practiceAdvice: JSON.parse(h.practiceAdviceJson),
    createdAt: h.createdAt.toISOString(),
  }));

  return NextResponse.json(parsed);
}
