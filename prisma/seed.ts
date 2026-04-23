import "dotenv/config";
import { PrismaClient, QuestionCategory } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const hashed = await bcrypt.hash("test1234", 10);

  const user = await prisma.user.upsert({
    where: { email: "student1@example.com" },
    update: {},
    create: {
      name: "Student 1",
      email: "student1@example.com",
      password: hashed,
      role: "student",
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher1@example.com" },
    update: {},
    create: {
      name: "Teacher 1",
      email: "teacher1@example.com",
      password: hashed,
      role: "teacher",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin1@example.com" },
    update: {},
    create: {
      name: "Admin 1",
      email: "admin1@example.com",
      password: hashed,
      role: "admin",
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

  await prisma.question.createMany({
    data: [
      {
        examId: exam.id,
        text: "『えき』の意味はどれですか。",
        category: QuestionCategory.VOCAB,
        type: "mcq",
        options: {
          A: "school",
          B: "station",
          C: "hospital",
          D: "shop",
        } as any,
        answer: "B",
        explanation: "えき means station.",
      },
      {
        examId: exam.id,
        text: "この写真は何ですか。",
        category: QuestionCategory.INFO,
        type: "image-mcq",
        options: {
          A: "駅",
          B: "学校",
          C: "病院",
          D: "店",
        } as any,
        answer: "A",
        imageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=1200&auto=format&fit=crop",
        explanation: "This image is a station-related scene.",
      },
      {
        examId: exam.id,
        text: "音声を聞いて、正しい答えを選んでください。",
        category: QuestionCategory.LISTENING,
        type: "audio-mcq",
        options: {
          A: "パン",
          B: "水",
          C: "電車",
          D: "学校",
        } as any,
        answer: "B",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        explanation: "Sample listening item.",
      },
    ],
  });

  console.log("Seed completed successfully.");
  console.log("Student:", user.email, "password: test1234");
  console.log("Teacher:", teacher.email, "password: test1234");
  console.log("Admin:", admin.email, "password: test1234");
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