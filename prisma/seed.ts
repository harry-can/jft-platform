import "dotenv/config";
import {
  PrismaClient,
  QuestionCategory,
  QuestionDifficulty,
  SetType,
  UserRole,
} from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash("test1234", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin1@example.com" },
    update: {
      name: "Admin 1",
      password: hash,
      role: UserRole.ADMIN,
    },
    create: {
      name: "Admin 1",
      email: "admin1@example.com",
      password: hash,
      role: UserRole.ADMIN,
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher1@example.com" },
    update: {
      name: "Teacher 1",
      password: hash,
      role: UserRole.TEACHER,
    },
    create: {
      name: "Teacher 1",
      email: "teacher1@example.com",
      password: hash,
      role: UserRole.TEACHER,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student1@example.com" },
    update: {
      name: "Student 1",
      password: hash,
      role: UserRole.STUDENT,
    },
    create: {
      name: "Student 1",
      email: "student1@example.com",
      password: hash,
      role: UserRole.STUDENT,
    },
  });

  const classRoom = await prisma.classRoom.upsert({
    where: { joinCode: "JFT001" },
    update: {
      name: "Batch A",
      teacherId: teacher.id,
    },
    create: {
      name: "Batch A",
      teacherId: teacher.id,
      joinCode: "JFT001",
      description: "Demo JFT class",
    },
  });

  await prisma.classMember.upsert({
    where: {
      classRoomId_userId: {
        classRoomId: classRoom.id,
        userId: student.id,
      },
    },
    update: {},
    create: {
      classRoomId: classRoom.id,
      userId: student.id,
    },
  });

  const practiceSet = await prisma.practiceSet.upsert({
    where: { id: "demo-practice-set" },
    update: {},
    create: {
      id: "demo-practice-set",
      title: "JFT Full Practice Set 1",
      description: "Vocabulary, grammar, reading, image and listening practice.",
      type: SetType.FULL_PRACTICE,
      difficulty: QuestionDifficulty.MEDIUM,
      isPublished: true,
      createdById: admin.id,
    },
  });

  const examSet = await prisma.practiceSet.upsert({
    where: { id: "demo-official-exam" },
    update: {},
    create: {
      id: "demo-official-exam",
      title: "Official Style JFT Mock Exam 1",
      description: "Timed official-style exam with image/audio questions.",
      type: SetType.OFFICIAL_EXAM,
      difficulty: QuestionDifficulty.OFFICIAL,
      isPublished: true,
      timeLimitMin: 60,
      audioReplayLimit: 1,
      createdById: admin.id,
    },
  });

  const count = await prisma.question.count({
    where: { practiceSetId: practiceSet.id },
  });

  if (count === 0) {
    await prisma.question.createMany({
      data: [
        {
          practiceSetId: practiceSet.id,
          text: "『えき』の意味はどれですか。",
          category: QuestionCategory.VOCAB,
          difficulty: QuestionDifficulty.EASY,
          type: "mcq",
          tags: ["vocabulary", "place"],
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
          practiceSetId: practiceSet.id,
          text: "毎日7時に（　　　）。",
          category: QuestionCategory.GRAMMAR,
          difficulty: QuestionDifficulty.EASY,
          type: "mcq",
          tags: ["grammar", "verb"],
          options: {
            A: "起きます",
            B: "起きた",
            C: "起きて",
            D: "起きる",
          } as any,
          answer: "A",
          explanation: "毎日 uses present/habit form: 起きます。",
        },
        {
          practiceSetId: practiceSet.id,
          text: "この写真は何ですか。",
          category: QuestionCategory.INFO,
          difficulty: QuestionDifficulty.MEDIUM,
          type: "image-mcq",
          tags: ["image", "daily life"],
          imageUrl:
            "https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=1200&auto=format&fit=crop",
          options: {
            A: "駅",
            B: "学校",
            C: "病院",
            D: "店",
          } as any,
          answer: "A",
          explanation: "This is a station-related image.",
        },
        {
          practiceSetId: practiceSet.id,
          text: "音声を聞いて、正しい答えを選んでください。",
          category: QuestionCategory.LISTENING,
          difficulty: QuestionDifficulty.MEDIUM,
          type: "audio-mcq",
          tags: ["listening"],
          audioUrl:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          options: {
            A: "パン",
            B: "水",
            C: "電車",
            D: "学校",
          } as any,
          answer: "B",
          explanation: "Sample listening question.",
        },
      ],
    });
  }

  const examCount = await prisma.question.count({
    where: { practiceSetId: examSet.id },
  });

  if (examCount === 0) {
    await prisma.question.createMany({
      data: [
        {
          practiceSetId: examSet.id,
          text: "『けんこう』の意味はどれですか。",
          category: QuestionCategory.VOCAB,
          difficulty: QuestionDifficulty.OFFICIAL,
          type: "mcq",
          tags: ["official", "vocabulary"],
          options: {
            A: "病気",
            B: "健康",
            C: "時間",
            D: "お金",
          } as any,
          answer: "B",
        },
        {
          practiceSetId: examSet.id,
          text: "雨が降っている（　　　）、出かけません。",
          category: QuestionCategory.GRAMMAR,
          difficulty: QuestionDifficulty.OFFICIAL,
          type: "mcq",
          tags: ["official", "grammar"],
          options: {
            A: "から",
            B: "と",
            C: "が",
            D: "で",
          } as any,
          answer: "A",
        },
      ],
    });
  }

  console.log("Seed complete.");
  console.log("Admin: admin1@example.com / test1234");
  console.log("Teacher: teacher1@example.com / test1234");
  console.log("Student: student1@example.com / test1234");
  console.log("Class join code: JFT001");
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });