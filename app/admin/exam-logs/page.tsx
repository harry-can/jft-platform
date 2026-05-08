"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

export default function AdminExamLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/exam-logs")
      .then((res) => res.json())
      .then((data) => setLogs(data.logs || []));
  }, []);

  return (
    <main className="min-h-screen bg-[#f7fff2] p-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl">
          <div className="flex items-center gap-4">
            <AlertTriangle className="text-red-600" size={48} />
            <div>
              <h1 className="text-4xl font-black">Exam Violation Logs</h1>
              <p className="text-gray-500">
                Track tab switches, blocked keys, fullscreen exits, and suspicious activity.
              </p>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4">Date</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Message</th>
                  <th className="p-4">Attempt</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="p-4">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-black">{log.action}</td>
                    <td className="p-4">{log.message}</td>
                    <td className="p-4">{log.entityId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}