"use client";

import { useEffect, useState } from "react";

export default function StudentProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetch("/api/student/dashboard")
      .then((res) => res.json())
      .then(setUser);
  }, []);

  async function uploadImage() {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/student/profile-image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      alert("Profile image updated");
      window.location.reload();
    }
  }

  return (
    <main className="min-h-screen bg-[#f7fff2] p-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-xl">
        <h1 className="text-4xl font-black">My Profile</h1>

        <div className="mt-8 flex items-center gap-6">
          <img
            src={user?.imageUrl || "/images/default-student.png"}
            className="h-32 w-32 rounded-full object-cover shadow"
            alt="Student"
          />

          <div>
            <h2 className="text-2xl font-black">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <p className="mt-2 font-bold">Level: {user?.level}</p>
            <p className="font-bold">XP: {user?.xp}</p>
          </div>
        </div>

        <div className="mt-8">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <button
            onClick={uploadImage}
            className="mt-4 block rounded-2xl bg-green-500 px-6 py-3 font-black text-white"
          >
            Upload New Image
          </button>
        </div>
      </div>
    </main>
  );
}