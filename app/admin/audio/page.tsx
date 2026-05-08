"use client";

import { useState } from "react";

export default function AdminAudioUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");

  async function uploadAudio() {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/audio/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      setAudioUrl(data.audioUrl);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7fff2] p-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-xl">
        <h1 className="text-4xl font-black">Upload JLPT / JFT Audio</h1>

        <p className="mt-3 text-gray-600">
          Upload listening audio and copy the generated URL into your question CSV.
        </p>

        <input
          className="mt-8"
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={uploadAudio}
          className="mt-6 block rounded-2xl bg-green-500 px-6 py-4 font-black text-white"
        >
          Upload Audio
        </button>

        {audioUrl && (
          <div className="mt-8 rounded-2xl bg-green-50 p-5">
            <p className="font-black text-green-700">Audio URL:</p>
            <code className="mt-2 block rounded-xl bg-white p-4">
              {audioUrl}
            </code>

            <audio controls src={audioUrl} className="mt-4 w-full" />
          </div>
        )}
      </div>
    </main>
  );
}