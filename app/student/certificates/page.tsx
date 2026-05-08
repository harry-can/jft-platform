"use client";

import { useEffect, useState } from "react";
import { Award } from "lucide-react";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/certificates")
      .then((res) => res.json())
      .then((data) => setCertificates(data.certificates || []));
  }, []);

  return (
    <main className="min-h-screen bg-[#f7fff2] p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="flex items-center gap-3 text-4xl font-black">
          <Award className="text-yellow-500" />
          My Certificates
        </h1>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="rounded-[2rem] border-4 border-yellow-400 bg-white p-8 text-center shadow-xl"
            >
              <Award className="mx-auto text-yellow-500" size={64} />

              <h2 className="mt-4 text-2xl font-black">{cert.title}</h2>

              <p className="mt-3 text-lg">
                Score: <span className="font-black">{cert.score}%</span>
              </p>

              <p className="mt-3 text-sm text-gray-500">
                Verification Code:
              </p>

              <p className="font-mono font-black">{cert.verificationCode}</p>

              <p className="mt-4 text-sm text-gray-500">
                Issued: {new Date(cert.issuedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {certificates.length === 0 && (
          <div className="mt-8 rounded-[2rem] bg-white p-8 text-center shadow">
            <p className="text-2xl font-black">No certificates yet</p>
            <p className="mt-2 text-gray-500">
              Pass an official mock exam with 80% or more to generate one.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}