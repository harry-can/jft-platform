import { prisma } from "@/lib/prisma";

export async function rebuildWeaknessProfile(userId: string) {
  const answers = await prisma.attemptAnswer.findMany({
    where: { attempt: { userId } },
    include: { question: true },
  });

  const grouped = new Map<string, { total: number; correct: number }>();

  for (const a of answers) {
    const key = a.question.category;
    const current = grouped.get(key) || { total: 0, correct: 0 };
    current.total += 1;
    if (a.isCorrect) current.correct += 1;
    grouped.set(key, current);
  }

  for (const [category, stats] of grouped.entries()) {
    const accuracy = stats.total ? (stats.correct / stats.total) * 100 : 0;
    const weaknessLevel = accuracy < 60 ? "weak" : accuracy < 80 ? "developing" : "strong";

    await prisma.weaknessProfile.upsert({
      where: {
        userId_category: {
          userId,
          category: category as any,
        } as any,
      },
      update: {
        attemptsCount: stats.total,
        correctCount: stats.correct,
        accuracy,
        weaknessLevel,
      },
      create: {
        userId,
        category: category as any,
        attemptsCount: stats.total,
        correctCount: stats.correct,
        accuracy,
        weaknessLevel,
      },
    });
  }
}