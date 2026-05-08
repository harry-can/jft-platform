"use client";

import { useState } from "react";
import Papa from "papaparse";

export default function UploadQuestionsPage() {
  const [csv, setCsv] = useState("");

  const sample = `testSetId,text,category,difficulty,type,optionA,optionB,optionC,optionD,answer,explanation,audioUrl,transcript
TEST_SET_ID,私は日本語を___。,GRAMMAR,EASY,mcq,べんきょうします,たべます,のみます,いきます,A,べんきょうします means study.,,
TEST_SET_ID,音声を聞いて正しい答えを選んでください。,LISTENING,MEDIUM,audio_mcq,駅へ行きます,学校へ行きます,家へ帰ります,店へ行きます,B,Speaker says 学校へ行きます。,/audio/sample-listening.mp3,学校へ行きます。`;

  async function upload() {
    const parsed = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
    });

    const rows = parsed.data as any[];

    const questions = rows.map((row) => ({
      testSetId: row.testSetId,
      text: row.text,
      category: row.category,
      difficulty: row.difficulty,
      type: row.type,
      options: [
        { id: "A", text: row.optionA },
        { id: "B", text: row.optionB },
        { id: "C", text: row.optionC },
        { id: "D", text: row.optionD },
      ],
      answer: row.answer,
      explanation: row.explanation,
      audioUrl: row.audioUrl || null,
      transcript: row.transcript || null,
    }));

    const res = await fetch("/api/admin/questions/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ questions }),
    });

    const data = await res.json();
    alert(`${data.count} questions uploaded`);
  }

  return (
    <main className="min-h-screen bg-[#f7fff2] p-8">
      <div className="mx-auto max-w-5xl rounded-[2rem] bg-white p-8 shadow-xl">
        <h1 className="text-4xl font-black">Bulk Upload JLPT / JFT Questions</h1>

        <button
          onClick={() => setCsv(sample)}
          className="mt-6 rounded-2xl bg-green-500 px-6 py-4 font-black text-white"
        >
          Load Sample
        </button>

        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          className="mt-6 h-96 w-full rounded-2xl border p-4 font-mono"
        />

        <button
          onClick={upload}
          className="mt-6 rounded-2xl bg-gray-900 px-8 py-4 font-black text-white"
        >
          Upload Questions
        </button>
      </div>
    </main>
  );
}