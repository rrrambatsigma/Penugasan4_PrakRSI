"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  getEvents,
  type Event as EventData,
} from "@/lib/services/eventService";
import {
  isAuthenticated,
  logoutUser,
} from "@/lib/services/authService";

function formatDate(iso: string) {
  try {
    const date = new Date(iso);
    return date
      .toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
      .toUpperCase();
  } catch {
    return iso;
  }
}

function getStatus(event: EventData): "TERSEDIA" | "PENUH" {
  const now = new Date();
  const end = new Date(event.end_at);
  if (end < now) return "PENUH";
  return "TERSEDIA";
}

const statusConfig = {
  TERSEDIA: {
    label: "TERSEDIA",
    dot: "bg-green-500",
    text: "text-green-700",
    bg: "bg-green-100",
  },
  PENUH: {
    label: "SELESAI",
    dot: "bg-gray-400",
    text: "text-gray-600",
    bg: "bg-gray-100",
  },
} as const;

function StatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function EventCard({ event }: { event: EventData }) {
  const status = getStatus(event);

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <StatusBadge status={status} />
        <span className="text-xs font-semibold text-indigo-500 shrink-0">
          {formatDate(event.started_at)}
        </span>
      </div>

      <h3 className="mb-1.5 text-base font-bold text-gray-900 leading-snug">
        {event.name}
      </h3>

      <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-500 line-clamp-2">
        {event.description}
      </p>

      <div className="mb-4">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Quota Status
        </p>
        <p className="text-sm font-semibold text-gray-800">
          {event.quota} slot tersedia
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={status === "PENUH"}
          className="flex-1 border-0 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {status === "PENUH" ? "Selesai" : "Daftar Sekarang"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          Detail Event
        </Button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
      return;
    }

    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Gagal memuat daftar event";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [router]);

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 mx-auto">
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <span className="text-base font-bold text-gray-900 tracking-tight">
            Pingfest - Dashboard
          </span>
          <Button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Logout
          </Button>
        </div>
      </nav>

      <section className="pb-8 pt-14 text-center">
        <div className="container mx-auto px-4">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Daftar Event
          </h1>
          <p className="mb-8 text-base text-gray-500">
            Event-event yang tersedia di Pingfest.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 pb-16">
        {isLoading && (
          <p className="py-24 text-center text-gray-400">Memuat event...</p>
        )}

        {!isLoading && error && (
          <div className="mx-auto max-w-lg rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {!isLoading && !error && events.length === 0 && (
          <p className="py-24 text-center text-gray-400">
            Belum ada event tersedia.
          </p>
        )}

        {!isLoading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}