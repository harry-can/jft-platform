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
      isActive: true,
    },
    create: {
      name: "Admin 1",
      email: "admin1@example.com",
      password: hash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher1@example.com" },
    update: {
      name: "Teacher 1",
      password: hash,
      role: UserRole.TEACHER,
      isActive: true,
    },
    create: {
      name: "Teacher 1",
      email: "teacher1@example.com",
      password: hash,
      role: UserRole.TEACHER,
      isActive: true,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student1@example.com" },
    update: {
      name: "Student 1",
      password: hash,
      role: UserRole.STUDENT,
      isActive: true,
    },
    create: {
      name: "Student 1",
      email: "student1@example.com",
      password: hash,
      role: UserRole.STUDENT,
      isActive: true,
    },
  });

  const classRoom = await prisma.classRoom.upsert({
    where: { joinCode: "JFT001" },
    update: {
      name: "Batch A",
      teacherId: teacher.id,
      description: "Demo JFT class",
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

  await prisma.lesson.upsert({
    where: { slug: "n4-grammar-ta-koto-ga-arimasu" },
    update: {
      title: "N4 Grammar: 〜たことがあります",
      type: "GRAMMAR",
      category: QuestionCategory.GRAMMAR,
      orderIndex: 1,
      isPublished: true,
      content: `Pattern:
Verb past casual + ことがあります

Meaning:
I have experience doing something.

Example:
日本へ行ったことがあります。
I have been to Japan.

Negative:
日本へ行ったことがありません。
I have never been to Japan.`,
      examples: [
        {
          jp: "すしを食べたことがあります。",
          en: "I have eaten sushi before.",
        },
      ],
    },
    create: {
      title: "N4 Grammar: 〜たことがあります",
      slug: "n4-grammar-ta-koto-ga-arimasu",
      type: "GRAMMAR",
      category: QuestionCategory.GRAMMAR,
      orderIndex: 1,
      isPublished: true,
      content: `Pattern:
Verb past casual + ことがあります

Meaning:
I have experience doing something.

Example:
日本へ行ったことがあります。
I have been to Japan.

Negative:
日本へ行ったことがありません。
I have never been to Japan.`,
      examples: [
        {
          jp: "すしを食べたことがあります。",
          en: "I have eaten sushi before.",
        },
      ],
    },
  });

  await prisma.lesson.upsert({
    where: { slug: "n4-grammar-nakereba-narimasen" },
    update: {
      title: "N4 Grammar: 〜なければなりません",
      type: "GRAMMAR",
      category: QuestionCategory.GRAMMAR,
      orderIndex: 2,
      isPublished: true,
      content: `Pattern:
Verb negative stem + なければなりません

Meaning:
must / have to

Example:
毎日勉強しなければなりません。
I must study every day.`,
      examples: [
        {
          jp: "薬を飲まなければなりません。",
          en: "I must take medicine.",
        },
      ],
    },
    create: {
      title: "N4 Grammar: 〜なければなりません",
      slug: "n4-grammar-nakereba-narimasen",
      type: "GRAMMAR",
      category: QuestionCategory.GRAMMAR,
      orderIndex: 2,
      isPublished: true,
      content: `Pattern:
Verb negative stem + なければなりません

Meaning:
must / have to

Example:
毎日勉強しなければなりません。
I must study every day.`,
      examples: [
        {
          jp: "薬を飲まなければなりません。",
          en: "I must take medicine.",
        },
      ],
    },
  });

  await prisma.lesson.upsert({
    where: { slug: "n4-vocab-places" },
    update: {
      title: "N4 Vocabulary: Places",
      type: "VOCAB",
      category: QuestionCategory.VOCAB,
      orderIndex: 3,
      isPublished: true,
      content: `Important N4 place words:

駅（えき）station
学校（がっこう）school
病院（びょういん）hospital
会社（かいしゃ）company
店（みせ）shop

Example:
駅はどこですか。
Where is the station?`,
      examples: [
        {
          jp: "会社へ行きます。",
          en: "I go to the company.",
        },
      ],
    },
    create: {
      title: "N4 Vocabulary: Places",
      slug: "n4-vocab-places",
      type: "VOCAB",
      category: QuestionCategory.VOCAB,
      orderIndex: 3,
      isPublished: true,
      content: `Important N4 place words:

駅（えき）station
学校（がっこう）school
病院（びょういん）hospital
会社（かいしゃ）company
店（みせ）shop

Example:
駅はどこですか。
Where is the station?`,
      examples: [
        {
          jp: "会社へ行きます。",
          en: "I go to the company.",
        },
      ],
    },
  });

  const fullPracticeSet = await prisma.practiceSet.upsert({
    where: { id: "demo-practice-set" },
    update: {
      title: "JFT Full Practice Set 1",
      description: "Vocabulary, grammar, reading, image and listening practice.",
      type: SetType.FULL_PRACTICE,
      difficulty: QuestionDifficulty.MEDIUM,
      isPublished: true,
      timeLimitMin: 40,
      createdById: admin.id,
    },
    create: {
      id: "demo-practice-set",
      title: "JFT Full Practice Set 1",
      description: "Vocabulary, grammar, reading, image and listening practice.",
      type: SetType.FULL_PRACTICE,
      difficulty: QuestionDifficulty.MEDIUM,
      isPublished: true,
      timeLimitMin: 40,
      createdById: admin.id,
    },
  });

  const officialExamSet = await prisma.practiceSet.upsert({
    where: { id: "demo-official-exam" },
    update: {
      title: "Official Style JFT Mock Exam 1",
      description: "Timed official-style exam with image/audio questions.",
      type: SetType.OFFICIAL_EXAM,
      difficulty: QuestionDifficulty.OFFICIAL,
      isPublished: true,
      timeLimitMin: 60,
      audioReplayLimit: 1,
      createdById: admin.id,
      sectionConfig: {
        VOCAB: 2,
        GRAMMAR: 2,
        KANJI: 1,
        LISTENING: 1,
        INFO: 1,
      },
    },
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
      sectionConfig: {
        VOCAB: 2,
        GRAMMAR: 2,
        KANJI: 1,
        LISTENING: 1,
        INFO: 1,
      },
    },
  });

  const grammarPracticeSet = await prisma.practiceSet.upsert({
    where: { id: "demo-n4-grammar-set" },
    update: {
      title: "N4 Grammar Practice 1",
      description: "Basic N4 grammar practice set.",
      type: SetType.CATEGORY_PRACTICE,
      category: QuestionCategory.GRAMMAR,
      difficulty: QuestionDifficulty.MEDIUM,
      isPublished: true,
      timeLimitMin: 20,
      createdById: admin.id,
    },
    create: {
      id: "demo-n4-grammar-set",
      title: "N4 Grammar Practice 1",
      description: "Basic N4 grammar practice set.",
      type: SetType.CATEGORY_PRACTICE,
      category: QuestionCategory.GRAMMAR,
      difficulty: QuestionDifficulty.MEDIUM,
      isPublished: true,
      timeLimitMin: 20,
      createdById: admin.id,
    },
  });

  const vocabPracticeSet = await prisma.practiceSet.upsert({
    where: { id: "demo-n4-vocab-set" },
    update: {
      title: "N4 Vocabulary Practice 1",
      description: "Basic N4 vocabulary practice set.",
      type: SetType.CATEGORY_PRACTICE,
      category: QuestionCategory.VOCAB,
      difficulty: QuestionDifficulty.EASY,
      isPublished: true,
      timeLimitMin: 15,
      createdById: admin.id,
    },
    create: {
      id: "demo-n4-vocab-set",
      title: "N4 Vocabulary Practice 1",
      description: "Basic N4 vocabulary practice set.",
      type: SetType.CATEGORY_PRACTICE,
      category: QuestionCategory.VOCAB,
      difficulty: QuestionDifficulty.EASY,
      isPublished: true,
      timeLimitMin: 15,
      createdById: admin.id,
    },
  });

  const kanjiPracticeSet = await prisma.practiceSet.upsert({
    where: { id: "demo-n4-kanji-set" },
    update: {
      title: "N4 Kanji Practice 1",
      description: "Basic N4 kanji practice set.",
      type: SetType.CATEGORY_PRACTICE,
      category: QuestionCategory.KANJI,
      difficulty: QuestionDifficulty.MEDIUM,
      isPublished: true,
      timeLimitMin: 15,
      createdById: admin.id,
    },
    create: {
      id: "demo-n4-kanji-set",
      title: "N4 Kanji Practice 1",
      description: "Basic N4 kanji practice set.",
      type: SetType.CATEGORY_PRACTICE,
      category: QuestionCategory.KANJI,
      difficulty: QuestionDifficulty.MEDIUM,
      isPublished: true,
      timeLimitMin: 15,
      createdById: admin.id,
    },
  });

  await prisma.assignment.upsert({
    where: {
      classRoomId_practiceSetId: {
        classRoomId: classRoom.id,
        practiceSetId: fullPracticeSet.id,
      },
    },
    update: {},
    create: {
      classRoomId: classRoom.id,
      practiceSetId: fullPracticeSet.id,
    },
  });

  await seedQuestions(fullPracticeSet.id, [
    {
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
      },
      answer: "B",
      explanation: "えき means station.",
      orderIndex: 1,
    },
    {
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
      },
      answer: "A",
      explanation: "毎日 uses present/habit form: 起きます。",
      orderIndex: 2,
    },
    {
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
      },
      answer: "A",
      explanation: "This is a station-related image.",
      orderIndex: 3,
    },
    {
      text: "音声を聞いて、正しい答えを選んでください。",
      category: QuestionCategory.LISTENING,
      difficulty: QuestionDifficulty.MEDIUM,
      type: "audio-mcq",
      tags: ["listening"],
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      replayLimit: 1,
      transcript: "Sample audio question transcript.",
      options: {
        A: "パン",
        B: "水",
        C: "電車",
        D: "学校",
      },
      answer: "B",
      explanation: "Sample listening question.",
      orderIndex: 4,
    },
    {
      text: "病院の読み方はどれですか。",
      category: QuestionCategory.KANJI,
      difficulty: QuestionDifficulty.MEDIUM,
      type: "mcq",
      tags: ["kanji", "reading"],
      options: {
        A: "びょういん",
        B: "びよういん",
        C: "ひょういん",
        D: "びょいん",
      },
      answer: "A",
      explanation: "病院 is read びょういん and means hospital.",
      orderIndex: 5,
    },
  ]);

  await seedQuestions(officialExamSet.id, [
    {
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
      },
      answer: "B",
      explanation: "けんこう means health.",
      orderIndex: 1,
    },
    {
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
      },
      answer: "A",
      explanation: "から means because/reason.",
      orderIndex: 2,
    },
    {
      text: "日本へ行った＿＿があります。",
      category: QuestionCategory.GRAMMAR,
      difficulty: QuestionDifficulty.OFFICIAL,
      type: "mcq",
      tags: ["official", "grammar"],
      options: {
        A: "もの",
        B: "こと",
        C: "ため",
        D: "よう",
      },
      answer: "B",
      explanation: "〜たことがあります means have experience doing something.",
      orderIndex: 3,
    },
    {
      text: "会社 means:",
      category: QuestionCategory.VOCAB,
      difficulty: QuestionDifficulty.OFFICIAL,
      type: "mcq",
      tags: ["official", "vocab"],
      options: {
        A: "company",
        B: "school",
        C: "station",
        D: "hospital",
      },
      answer: "A",
      explanation: "会社（かいしゃ）means company.",
      orderIndex: 4,
    },
    {
      text: "病院の読み方は？",
      category: QuestionCategory.KANJI,
      difficulty: QuestionDifficulty.OFFICIAL,
      type: "mcq",
      tags: ["official", "kanji"],
      options: {
        A: "びょういん",
        B: "びよういん",
        C: "ひょういん",
        D: "びょいん",
      },
      answer: "A",
      explanation: "病院 is read びょういん.",
      orderIndex: 5,
    },
  ]);

  await seedQuestions(grammarPracticeSet.id, [
    {
      text: "日本へ行った＿＿があります。",
      category: QuestionCategory.GRAMMAR,
      difficulty: QuestionDifficulty.MEDIUM,
      type: "mcq",
      tags: ["N4", "grammar"],
      options: {
        A: "もの",
        B: "こと",
        C: "ため",
        D: "よう",
      },
      answer: "B",
      explanation: "〜たことがあります means have experience doing something.",
      orderIndex: 1,
    },
    {
      text: "毎日勉強し＿＿なりません。",
      category: QuestionCategory.GRAMMAR,
      difficulty: QuestionDifficulty.MEDIUM,
      type: "mcq",
      tags: ["N4", "grammar"],
      options: {
        A: "なければ",
        B: "ても",
        C: "たり",
        D: "そう",
      },
      answer: "A",
      explanation: "〜なければなりません means must / have to.",
      orderIndex: 2,
    },
    {
      text: "ここで写真を撮って＿＿ですか。",
      category: QuestionCategory.GRAMMAR,
      difficulty: QuestionDifficulty.MEDIUM,
      type: "mcq",
      tags: ["N4", "grammar"],
      options: {
        A: "はいけません",
        B: "もいい",
        C: "なければ",
        D: "こと",
      },
      answer: "B",
      explanation: "〜てもいいですか asks permission.",
      orderIndex: 3,
    },
  ]);

  await seedQuestions(vocabPracticeSet.id, [
    {
      text: "駅 means:",
      category: QuestionCategory.VOCAB,
      difficulty: QuestionDifficulty.EASY,
      type: "mcq",
      tags: ["N4", "vocab"],
      options: {
        A: "school",
        B: "station",
        C: "hospital",
        D: "company",
      },
      answer: "B",
      explanation: "駅（えき）means station.",
      orderIndex: 1,
    },
    {
      text: "会社 means:",
      category: QuestionCategory.VOCAB,
      difficulty: QuestionDifficulty.EASY,
      type: "mcq",
      tags: ["N4", "vocab"],
      options: {
        A: "company",
        B: "school",
        C: "station",
        D: "hospital",
      },
      answer: "A",
      explanation: "会社（かいしゃ）means company.",
      orderIndex: 2,
    },
  ]);

  await seedQuestions(kanjiPracticeSet.id, [
    {
      text: "病院の読み方は？",
      category: QuestionCategory.KANJI,
      difficulty: QuestionDifficulty.MEDIUM,
      type: "mcq",
      tags: ["N4", "kanji"],
      options: {
        A: "びょういん",
        B: "びよういん",
        C: "ひょういん",
        D: "びょいん",
      },
      answer: "A",
      explanation: "病院 is read びょういん.",
      orderIndex: 1,
    },
    {
      text: "会社の読み方は？",
      category: QuestionCategory.KANJI,
      difficulty: QuestionDifficulty.MEDIUM,
      type: "mcq",
      tags: ["N4", "kanji"],
      options: {
        A: "がっこう",
        B: "かいしゃ",
        C: "びょういん",
        D: "えき",
      },
      answer: "B",
      explanation: "会社 is read かいしゃ.",
      orderIndex: 2,
    },
  ]);

  console.log("Seed complete.");
  console.log("Admin: admin1@example.com / test1234");
  console.log("Teacher: teacher1@example.com / test1234");
  console.log("Student: student1@example.com / test1234");
  console.log("Class join code: JFT001");
}

type SeedQuestion = {
  text: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  type: string;
  tags: string[];
  options: Record<string, string>;
  answer: string;
  explanation?: string;
  imageUrl?: string;
  audioUrl?: string;
  transcript?: string;
  replayLimit?: number;
  orderIndex: number;
};

async function seedQuestions(practiceSetId: string, questions: SeedQuestion[]) {
  const count = await prisma.question.count({
    where: { practiceSetId },
  });

  if (count > 0) {
    return;
  }

  await prisma.question.createMany({
    data: questions.map((q) => ({
      practiceSetId,
      text: q.text,
      category: q.category,
      difficulty: q.difficulty,
      type: q.type,
      tags: q.tags,
      options: q.options as any,
      answer: q.answer,
      explanation: q.explanation,
      imageUrl: q.imageUrl,
      audioUrl: q.audioUrl,
      transcript: q.transcript,
      replayLimit: q.replayLimit,
      orderIndex: q.orderIndex,
      isPublished: true,
    })),
  });
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