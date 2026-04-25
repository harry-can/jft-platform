import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ retrySetId: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { retrySetId } = await params;

  const retrySet = await prisma.wrongRetrySet.findUnique({
    where: { id: retrySetId },
    include: {
      items: {
        where: { isResolved: false },
        include: {
          question: true,
        },
      },
    },
  });

  if (!retrySet || retrySet.userId !== user.id) {
    return NextResponse.json({ error: "Retry set not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: retrySet.id,
    questions: retrySet.items.map((item) => item.question),
  });
}