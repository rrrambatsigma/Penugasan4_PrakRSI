"use client";

import { useCallback, useEffect, useState } from "react";

interface Event {
  id: string;
  name: string;
  description: string;
  quota: number;
  started_at: string;
  ended_at: string;
}


export default function EventsPage() {
const [events, setEvents] = useState<Event[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [filter, setFilter] = useState("all");

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quota, setQuota] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const API_URL = "http://127.0.0.1:8000";

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/events/`);

      if (!response.ok) {
        throw new Error("Failed fetch events");
      }

      const result = await response.json();

      console.log(result);

      setEvents(result.data || []);
    } catch (error) {
      console.error(error);

      setError("Failed connect to backend");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "http://localhost:3000/auth/login"
      return;
    }

    fetchEvents();
  }, [fetchEvents]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setQuota("");
    setStartDate("");
    setEndDate("");
    setSelectedId(null);
  };

  const getEventStatus = (endedAt: string) => {
    const now = new Date();
    const end = new Date(endedAt);

    return end < now ? "done" : "active";
  };

  const filteredEvents = events.filter((event) => {
    if (filter === "active") {
      return getEventStatus(event.ended_at) === "active";
    }

    if (filter === "done") {
      return getEventStatus(event.ended_at) === "done";
    }

    return true;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
    });
  };

  const formatInputDate = (date: string) => {
    const localDate = new Date(date);

    localDate.setMinutes(
      localDate.getMinutes() - localDate.getTimezoneOffset()
    );

    return localDate.toISOString().slice(0, 16);
  };

  const openEditModal = (event: Event) => {
    setSelectedId(event.id);

    setName(event.name);
    setDescription(event.description);
    setQuota(String(event.quota));

    setStartDate(formatInputDate(event.started_at));
    setEndDate(formatInputDate(event.ended_at));

    setShowEditModal(true);
  };

  const handleCreate = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login terlebih dahulu");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/events/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          quota: Number(quota),
          start_date: `${startDate}:00`,
          end_date: `${endDate}:00`,
        }),
      });

      if (!response.ok) {
        alert("Gagal membuat event");
        return;
      }

      setShowCreateModal(false);

      resetForm();

      fetchEvents();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = async () => {
    if (!selectedId) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login terlebih dahulu");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/events/${selectedId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            description,
            quota: Number(quota),
            start_date: `${startDate}:00`,
            end_date: `${endDate}:00`,
          }),
        }
      );

      if (!response.ok) {
        alert("Gagal update event");
        return;
      }

      setShowEditModal(false);

      resetForm();

      fetchEvents();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login terlebih dahulu");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/events/${selectedId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        alert("Gagal menghapus event");
        return;
      }

      setShowDeleteModal(false);

      fetchEvents();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg font-semibold">
        Loading events...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600">
              Acara RSI
            </p>

            <h1 className="text-5xl font-bold tracking-tight text-slate-950">
              Event Management
            </h1>

            <p className="mt-3 text-slate-600">
              Kelola seluruh event competition.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
          >
            + Create Event
          </button>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              filter === "all"
                ? "bg-indigo-600 text-white"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            Semua
          </button>

          <button
            onClick={() => setFilter("active")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              filter === "active"
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            Active
          </button>

          <button
            onClick={() => setFilter("done")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              filter === "done"
                ? "bg-gray-700 text-white"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            Done
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => {
            const isDone = getEventStatus(event.ended_at) === "done";
            const status =
              event.quota === 0
                ? {
                    label: "Penuh",
                    badge: "bg-gray-200 text-gray-700",
                    progress: "bg-gray-400",
                  }
                : isDone
                ? {
                    label: "Done",
                    badge: "bg-slate-200 text-slate-700",
                    progress: "bg-slate-500",
                  }
                : event.quota <= 10
                ? {
                    label: "Hampir Penuh",
                    badge: "bg-orange-100 text-orange-700",
                    progress: "bg-orange-500",
                  }
                : {
                    label: "Tersedia",
                    badge: "bg-emerald-100 text-emerald-700",
                    progress: "bg-emerald-500",
                  };
                  
            return (
              <div
                key={event.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${status.badge}`}
                  >
                    {status.label}
                  </span>

                  <span className="text-xs font-bold uppercase text-indigo-600">
                    {formatDate(event.started_at)}
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
                    {event.quota} Participant Slots
                  </p>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${status.progress}`}
                      style={{
                        width:
                          event.quota >= 100
                            ? "55%"
                            : event.quota >= 50
                            ? "70%"
                            : event.quota >= 10
                            ? "85%"
                            : "100%",
                      }}                    />
                  </div>
                </div>

                <div className="mt-5 text-xs text-slate-500">
                  <p>Mulai: {formatDate(event.started_at)}</p>
                  <p>Selesai: {formatDate(event.ended_at)}</p>
                </div>

                <div className="mt-6 flex gap-3">
                  <>
                    <button
                      onClick={() => openEditModal(event)}
                      className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setSelectedId(event.id);
                        setShowDeleteModal(true);
                      }}
                      className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900">
              {showCreateModal ? "Create Event" : "Edit Event"}
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nama Event
                </label>

                <input
                  type="text"
                  placeholder="Nama Event"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Detail Event
                </label>
                <textarea
                  placeholder="Deskripsi"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-32 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Slots Peserta
                </label>

                <input
                  type="number"
                  placeholder="Contoh: 100"
                  value={quota}
                  onChange={(e) => setQuota(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-4 outline-none transition focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tanggal Mulai
                </label>

                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-4 outline-none transition focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tanggal Selesai
                </label>

                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-4 outline-none transition focus:border-indigo-500"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold"
                >
                  Cancel
                </button>

                <button
                  onClick={showCreateModal ? handleCreate : handleEdit}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900">
              Hapus Event?
            </h2>

            <p className="mt-3 text-slate-500">
              Event akan dihapus permanen.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}