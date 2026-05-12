"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

interface Event {
  id: string;
  name: string;
  description: string;
  quota: number;
  started_at: string;
  ended_at: string;
}

export default function HomePage() {
  const router = useRouter();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);

  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const ITEMS_PER_PAGE = 3;
  const showMessage = (text: string, error = false) => {
    setMessage(text)
    setIsError(error)

    setTimeout(() => {
      setMessage("")
    }, 3000)
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentRole, setCurrentRole] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = getRoleFromToken(token)

    setIsLoggedIn(!!token)
    setCurrentRole(role)
  }, [])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/events/`
        );

        if (!response.ok) {
          throw new Error("Failed fetch events");
        }

        const result = await response.json();

        setEvents(result.data || []);
      } catch (error) {
        console.error(error);

        setError("Failed connect to backend");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("refresh_token")

    setIsLoggedIn(false)
    setCurrentRole(null)
  }

  const getEventStatus = (
    quota: number,
    endedAt: string
  ) => {
    const now = new Date()
    const endDate = new Date(endedAt)

    // Event sudah selesai
    if (endDate < now) {
      return {
        text: "Selesai",
        statusColor:
          "bg-slate-200 text-slate-600",
        progressColor: "bg-slate-400",
        progressWidth: "100%",
      }
    }

    // Kuota habis
    if (quota <= 0) {
      return {
        text: "Penuh",
        statusColor:
          "bg-gray-200 text-gray-600",
        progressColor: "bg-gray-400",
        progressWidth: "100%",
      }
    }

    // Hampir penuh
    if (quota <= 10) {
      return {
        text: "Hampir Penuh",
        statusColor:
          "bg-orange-100 text-orange-700",
        progressColor: "bg-orange-500",
        progressWidth: "85%",
      }
    }

    // Masih tersedia
    return {
      text: "Tersedia",
      statusColor:
        "bg-emerald-100 text-emerald-700",
      progressColor: "bg-emerald-500",
      progressWidth: "100%",
    }
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const status = getEventStatus(
        event.quota,
        event.ended_at
      );

      const matchSearch =
        event.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        event.description
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchFilter =
        filter === "Semua"
          ? true
          : status.text === filter;

      return matchSearch && matchFilter;
    });
  }, [events, search, filter]);

  const totalPages = Math.ceil(
    filteredEvents.length / ITEMS_PER_PAGE
  );

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const changePage = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "id-ID",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  const getRoleFromToken = (token: string | null) => {
    if (!token) return null

    try {
      const base64Url = token.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const paddedBase64 = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "="
      )

      const payload = JSON.parse(window.atob(paddedBase64))

      return payload.role_name || payload.role || null
    } catch (error) {
      console.error("Failed to decode token", error)
      return null
    }
  }

  const handleRegisterEvent = async (event: Event) => {
    const token = localStorage.getItem("token");
    const role = getRoleFromToken(token);

    if (!token) {
      showMessage("Silakan login sebagai User terlebih dahulu.", true)
      router.push("/auth/login");
      return;
    }

    if (role !== "USER") {
      showMessage("Pendaftaran event hanya untuk akun User, bukan Admin.", true)
      return;
    }

    if (event.quota <= 0) {
      showMessage("Kuota event sudah penuh.", true)
      return;
    }

    try {
      const response = await fetch(`${API_URL}/registrations/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          event_id: event.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        showMessage(
          result.detail?.message || result.message || "Gagal mendaftar event.",
          true
        )
        return;
      }

      showMessage("Berhasil mendaftar event.")

      setEvents((prevEvents) =>
        prevEvents.map((item) =>
          item.id === event.id
            ? {
                ...item,
                quota: Math.max(item.quota - 1, 0),
              }
            : item
        )
      );
    } catch (error) {
      console.error(error);
      showMessage("Terjadi kesalahan saat mendaftar event.", true)
    }
  };

  // This for EventDetail
  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg font-semibold">
        Loading events...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg font-semibold text-red-500">
        {error}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
          >
            Acara RSI
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
            <a
              href="#events"
              className="text-indigo-600"
            >
              Browse Event
            </a>

            <a
              href="#features"
              className="transition hover:text-indigo-600"
            >
              Features
            </a>

            <a
              href="#schedule"
              className="transition hover:text-indigo-600"
            >
              Schedule
            </a>
          </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {currentRole === "ADMIN" && (
                <Link
                  href="/admin/events"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Dashboard Admin
                </Link>
              )}

              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
              >
                Login
              </Link>

              <div className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Register
                  <span className="text-xs transition group-hover:rotate-180">▼</span>
                </button>

                <div className="invisible absolute right-0 top-full z-50 mt-2 w-56 translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <Link
                    href="/auth/register"
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    Register as User
                  </Link>

                  <Link
                    href="/auth/register/admin"
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    Register as Admin
                  </Link>
                </div>
              </div>
            </>
          )}
          </div>
        </nav>
      </header>

      {message && (
        <div className="fixed top-24 left-1/2 z-[200] -translate-x-1/2">
          <div
            className={`rounded-2xl px-6 py-4 text-sm font-bold shadow-2xl ${
              isError
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        </div>
      )}
      
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
          Discover Competition Events
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500 md:text-lg">
          Curated competitions tailored to
          your skills and passion.
        </p>

        <div className="mx-auto mt-8 max-w-xl">
          <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <span className="mr-3 text-slate-400">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search event..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </section>

      <section
        id="events"
        className="mx-auto max-w-7xl px-6 pb-20"
      >
        <div className="mb-8 flex flex-wrap gap-3">
          {[
            "Semua",
            "Tersedia",
            "Hampir Penuh",
            "Penuh",
            "Selesai",
          ].map((item) => (
            <button
              key={item}
              onClick={() => {
                setFilter(item);
                setCurrentPage(1);
              }}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                filter === item
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {paginatedEvents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-2xl font-bold text-slate-800">
              Event Tidak Ditemukan
            </h2>

            <p className="mt-3 text-slate-500">
              Coba gunakan keyword lain.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paginatedEvents.map((event) => {
                const status =
                  getEventStatus(event.quota, event.ended_at);

                return (
                  <article
                    key={event.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${status.statusColor}`}
                      >
                        {status.text}
                      </span>

                      <span className="text-xs font-bold uppercase text-indigo-500">
                        {formatDate(
                          event.started_at
                        )}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-950">
                      {event.name}
                    </h2>

                    <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-500">
                      {event.description}
                    </p>

                    <div className="mt-5">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Quota Status
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {event.quota} Slots
                      </p>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${status.progressColor}`}
                          style={{
                            width:
                              status.progressWidth,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedEvent(event)}
                        className="rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={
                          event.quota <= 0 ||
                          new Date(event.ended_at) < new Date()
                        }
                      >
                        Daftar
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedEvent(event)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                      >
                        Detail
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() =>
                  changePage(currentPage - 1)
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              {Array.from({
                length: totalPages,
              }).map((_, index) => (
                <button
                  key={index}
                  onClick={() =>
                    changePage(index + 1)
                  }
                  className={`h-10 w-10 rounded-xl text-sm font-bold transition ${
                    currentPage === index + 1
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  changePage(currentPage + 1)
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
                  Detail Event
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-slate-950">
                  {selectedEvent.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <p className="font-bold text-slate-800">Deskripsi</p>
                <p className="mt-1 leading-6">
                  {selectedEvent.description || "Tidak ada deskripsi."}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Mulai
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDateTime(selectedEvent.started_at)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Selesai
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDateTime(selectedEvent.ended_at)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-indigo-50 p-4">
                <p className="text-xs font-bold uppercase text-indigo-400">
                  Sisa Kuota
                </p>
                <p className="mt-1 text-lg font-extrabold text-indigo-700">
                  {selectedEvent.quota} Slots
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => {
                  handleRegisterEvent(selectedEvent);
                  setSelectedEvent(null);
                }}
                disabled={
                  selectedEvent.quota <= 0 ||
                  new Date(selectedEvent.ended_at) < new Date()
                }
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Konfirmasi Daftar
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900">
              Keluar dari akun?
            </h2>

            <p className="mt-3 text-slate-500">
              Apakah kamu yakin ingin logout dari sistem?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Tidak
              </button>

              <button
                type="button"
                onClick={() => {
                  handleLogout()
                  setShowLogoutModal(false)
                }}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-600"
              >
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}