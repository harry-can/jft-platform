import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const body = await req.json();

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a friendly Japanese teacher for JLPT and JFT students. Explain clearly using English, Japanese, romaji, grammar rule, and memory trick.",
      },
      {
        role: "user",
        content: `
Question: ${body.question}
Student answer: ${body.selectedAnswer}
Correct answer: ${body.correctAnswer}
Original explanation: ${body.explanation}

Explain the mistake and give one example.
        `,
      },
    ],
  });

  return NextResponse.json({
    explanation: response.choices[0].message.content,
  });
}