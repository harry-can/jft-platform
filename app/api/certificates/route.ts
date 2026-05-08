import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const certificates = await prisma.certificate.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        issuedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      certificates,
    });
  } catch (error) {
    console.error("Certificates error:", error);
    return NextResponse.json(
      { error: "Failed to load certificates" },
      { status: 500 }
    );
  }
}