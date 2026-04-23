import "dotenv/config";
import { PrismaClient, QuestionCategory } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "student1@example.com" },
    update: {},
    create: {
      name: "Student 1",
      email: "student1@example.com",
      password: "test1234",
      role: "student",
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher1@example.com" },
    update: {},
    create: {
      name: "Teacher 1",
      email: "teacher1@example.com",
      password: "test1234",
      role: "teacher",
    },
  });

  const exam = await prisma.exam.create({
    data: {
      title: "JFT Mock Exam 1",
      description: "Sample JFT-style practice exam",
    },
  });

  const classRoom = await prisma.classRoom.create({
    data: {
      name: "Batch A",
      teacherId: teacher.id,
    },
  });

  await prisma.classMember.create({
    data: {
      classRoomId: classRoom.id,
      userId: user.id,
    },
  });

  const q1 = await prisma.question.create({
    data: {
      examId: exam.id,
      text: "『えき』の意味はどれですか。",
      category: QuestionCategory.VOCAB,
      type: "mcq",
      options: {
        A: "school",
        B: "station",
        C: "hospital",
        D: "shop",
      },
      answer: "B",
    },
  });

  const q2 = await prisma.question.create({
    data: {
      examId: exam.id,
      text: "毎日7時に（　　　）。",
      category: QuestionCategory.GRAMMAR,
      type: "mcq",
      options: {
        A: "起きます",
        B: "起きた",
        C: "起きて",
        D: "起きる",
      },
      answer: "A",
    },
  });

  const q3 = await prisma.question.create({
    data: {
      examId: exam.id,
      text: "彼は電車で会社へ行きます。何で行きますか。",
      category: QuestionCategory.READING,
      type: "mcq",
      options: {
        A: "バス",
        B: "車",
        C: "電車",
        D: "歩き",
      },
      answer: "C",
    },
  });

  const attempt = await prisma.attempt.create({
    data: {
      userId: user.id,
      examId: exam.id,
      totalScore: 2,
      resultLabel: "Needs Improvement",
    },
  });

  await prisma.attemptAnswer.createMany({
    data: [
      {
        attemptId: attempt.id,
        questionId: q1.id,
        selectedChoiceId: "B",
        isCorrect: true,
        timeSpentSec: 20,
      },
      {
        attemptId: attempt.id,
        questionId: q2.id,
        selectedChoiceId: "A",
        isCorrect: true,
        timeSpentSec: 15,
      },
      {
        attemptId: attempt.id,
        questionId: q3.id,
        selectedChoiceId: "B",
        isCorrect: false,
        timeSpentSec: 25,
      },
    ],
  });

  await prisma.weaknessProfile.upsert({
    where: {
      userId_category: {
        userId: user.id,
        category: QuestionCategory.READING,
      },
    },
    update: {
      attemptsCount: 1,
      correctCount: 0,
      accuracy: 0,
      weaknessLevel: "weak",
    },
    create: {
      userId: user.id,
      category: QuestionCategory.READING,
      attemptsCount: 1,
      correctCount: 0,
      accuracy: 0,
      weaknessLevel: "weak",
    },
  });

  console.log("Seed completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });