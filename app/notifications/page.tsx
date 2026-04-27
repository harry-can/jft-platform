
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  href: string | null;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function loadNotifications() {
    const res = await fetch("/api/notifications");
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to load notifications");
      return;
    }

    setItems(data.notifications || []);
    setUnreadCount(data.unreadCount || 0);
    setLoading(false);
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "UNREAD") return items.filter((item) => !item.isRead);
    if (filter === "READ") return items.filter((item) => item.isRead);
    return items;
  }, [items, filter]);

  async function generateReminders() {
    setGenerating(true);

    const res = await fetch("/api/student/notifications/generate-reminders", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to generate reminders");
    } else {
      if (data.createdCount > 0) {
        alert(`${data.createdCount} reminder(s) created.`);
      }
      await loadNotifications();
    }

    setGenerating(false);
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        action: "READ",
      }),
    });

    await loadNotifications();
  }

  async function markUnread(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        action: "UNREAD",
      }),
    });

    await loadNotifications();
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "READ_ALL",
      }),
    });

    await loadNotifications();
  }

  async function deleteRead() {
    const ok = confirm("Delete all read notifications?");
    if (!ok) return;

    await fetch("/api/notifications", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    await loadNotifications();
  }

  async function deleteOne(id: string) {
    const ok = confirm("Delete this notification?");
    if (!ok) return;

    await fetch("/api/notifications", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
      }),
    });

    await loadNotifications();
  }

  if (loading) {
    return <div className="p-6">Loading notifications...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <section className="rounded-[2rem] bg-white p-8 shadow">
          <p className="font-bold text-blue-700">Student Notifications</p>
          <h1 className="mt-2 text-4xl font-black">Notifications</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Assignment reminders, due dates, overdue warnings, results, streaks, and wrong-question practice reminders.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card title="Total" value={items.length} />
            <Card title="Unread" value={unreadCount} />
            <Card title="Read" value={items.length - unreadCount} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={generateReminders}
              disabled={generating}
              className="rounded-2xl bg-black px-5 py-3 font-bold text-white disabled:opacity-50"
            >
              {generating ? "Checking..." : "Check Reminders"}
            </button>

            <button
              onClick={markAllRead}
              className="rounded-2xl border bg-white px-5 py-3 font-bold"
            >
              Mark All Read
            </button>

            <button
              onClick={deleteRead}
              className="rounded-2xl border border-red-300 bg-white px-5 py-3 font-bold text-red-600"
            >
              Delete Read
            </button>

            <Link
              href="/student/assignments"
              className="rounded-2xl border bg-white px-5 py-3 font-bold"
            >
              My Assignments
            </Link>

            <Link
              href="/student/home"
              className="rounded-2xl border bg-white px-5 py-3 font-bold"
            >
              Smart Home
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow">
          <div className="flex flex-wrap gap-2">
            {["ALL", "UNREAD", "READ"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-xl px-4 py-2 font-bold ${
                  filter === item ? "bg-black text-white" : "border bg-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {filtered.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                onRead={() => markRead(item.id)}
                onUnread={() => markUnread(item.id)}
                onDelete={() => deleteOne(item.id)}
              />
            ))}

            {filtered.length === 0 && (
              <div className="rounded-3xl border p-8 text-center">
                <h2 className="text-2xl font-black">No notifications</h2>
                <p className="mt-2 text-slate-500">
                  You are all caught up.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function NotificationCard({
  item,
  onRead,
  onUnread,
  onDelete,
}: {
  item: Notification;
  onRead: () => void;
  onUnread: () => void;
  onDelete: () => void;
}) {
  const typeStyle =
    item.type === "ASSIGNMENT"
      ? "bg-blue-100 text-blue-700"
      : item.type === "WEAKNESS"
      ? "bg-yellow-100 text-yellow-700"
      : item.type === "RESULT"
      ? "bg-green-100 text-green-700"
      : item.type === "STREAK"
      ? "bg-purple-100 text-purple-700"
      : "bg-slate-100 text-slate-700";

  const content = (
    <div
      className={`rounded-[2rem] border p-5 ${
        item.isRead ? "bg-white opacity-70" : "bg-white shadow"
      }`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-black ${typeStyle}`}>
              {item.type}
            </span>

            {!item.isRead && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                NEW
              </span>
            )}

            <span className="text-xs text-slate-500">
              {new Date(item.createdAt).toLocaleString()}
            </span>
          </div>

          <h3 className="mt-3 text-xl font-black">{item.title}</h3>
          <p className="mt-2 leading-7 text-slate-600">{item.message}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {item.href && (
            <Link
              href={item.href}
              onClick={onRead}
              className="rounded-xl bg-black px-4 py-2 font-bold text-white"
            >
              Open
            </Link>
          )}

          {item.isRead ? (
            <button
              onClick={onUnread}
              className="rounded-xl border px-4 py-2 font-bold"
            >
              Mark Unread
            </button>
          ) : (
            <button
              onClick={onRead}
              className="rounded-xl border px-4 py-2 font-bold"
            >
              Mark Read
            </button>
          )}

          <button
            onClick={onDelete}
            className="rounded-xl border border-red-300 px-4 py-2 font-bold text-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return content;
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  );
}
