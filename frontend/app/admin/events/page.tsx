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
  const [searchTerm, setSearchTerm] = useState("");

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

  // Fungsi logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "http://localhost:3000/auth/login";
  };

  // Fungsi back to landing
  const handleBackToLanding = () => {
    window.location.href = "http://localhost:3000"; // ganti dengan URL landing Anda
  };

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/events/`);
      if (!response.ok) throw new Error("Failed fetch events");
      const result = await response.json();
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
      window.location.href = "http://localhost:3000/auth/login";
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
    if (filter === "active" && getEventStatus(event.ended_at) !== "active")
      return false;
    if (filter === "done" && getEventStatus(event.ended_at) !== "done")
      return false;
    if (searchTerm.trim() !== "") {
      const keyword = searchTerm.toLowerCase();
      const matchName = event.name.toLowerCase().includes(keyword);
      const matchDesc = event.description.toLowerCase().includes(keyword);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  };

  const formatInputDate = (date: string) => {
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
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
      window.location.href = "http://localhost:3000/auth/login";
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
      if (response.status === 401) {
        localStorage.removeItem("token");
        alert("Sesi habis, silakan login ulang.");
        window.location.href = "http://localhost:3000/auth/login";
        return;
      }
      if (!response.ok) {
        alert("Gagal membuat event");
        return;
      }
      setShowCreateModal(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan");
    }
  };

  const handleEdit = async () => {
    if (!selectedId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Login terlebih dahulu");
      window.location.href = "http://localhost:3000/auth/login";
      return;
    }
    try {
      const response = await fetch(`${API_URL}/events/${selectedId}`, {
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
      });
      if (response.status === 401) {
        localStorage.removeItem("token");
        alert("Sesi habis, silakan login ulang.");
        window.location.href = "http://localhost:3000/auth/login";
        return;
      }
      if (!response.ok) {
        alert("Gagal update event");
        return;
      }
      setShowEditModal(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan");
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Login terlebih dahulu");
      window.location.href = "http://localhost:3000/auth/login";
      return;
    }
    try {
      const response = await fetch(`${API_URL}/events/${selectedId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        localStorage.removeItem("token");
        alert("Sesi habis, silakan login ulang.");
        window.location.href = "http://localhost:3000/auth/login";
        return;
      }
      if (!response.ok) {
        alert("Gagal menghapus event");
        return;
      }
      setShowDeleteModal(false);
      fetchEvents();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan");
    }
  };

  const handleExportCSV = () => {
    if (filteredEvents.length === 0) {
      alert("Tidak ada data untuk diekspor");
      return;
    }
    const headers = ["ID", "Nama Event", "Deskripsi", "Kuota", "Tanggal Mulai", "Tanggal Selesai", "Status"];
    const rows = filteredEvents.map((event) => {
      const status = getEventStatus(event.ended_at) === "done" ? "Selesai" : "Aktif";
      return [
        event.id,
        `"${event.name.replace(/"/g, '""')}"`,
        `"${event.description.replace(/"/g, '""')}"`,
        event.quota,
        formatDate(event.started_at),
        formatDate(event.ended_at),
        status,
      ];
    });
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "events.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        {/* Header dengan tombol logout & back */}
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
          <div className="flex gap-3">
            <button
              onClick={handleBackToLanding}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
            >
              ← Back to Landing
            </button>
            <button
              onClick={handleLogout}
              className="rounded-2xl border border-red-300 bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Filter dan Actions */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-sm">
            <input
              type="text"
              placeholder="Search event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              + Create
            </button>
            <button
              onClick={handleExportCSV}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Tabel Events (sama seperti sebelumnya) */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Event</th>
                  <th className="px-6 py-4 text-left font-bold">Quota</th>
                  <th className="px-6 py-4 text-left font-bold">Start Date</th>
                  <th className="px-6 py-4 text-left font-bold">End Date</th>
                  <th className="px-6 py-4 text-left font-bold">Status</th>
                  <th className="px-6 py-4 text-center font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const isDone = getEventStatus(event.ended_at) === "done";
                  const status =
                    event.quota === 0
                      ? { label: "Penuh", badge: "bg-gray-200 text-gray-700" }
                      : isDone
                      ? { label: "Done", badge: "bg-slate-200 text-slate-700" }
                      : event.quota <= 10
                      ? { label: "Hampir Penuh", badge: "bg-orange-100 text-orange-700" }
                      : { label: "Tersedia", badge: "bg-emerald-100 text-emerald-700" };
                  return (
                    <tr key={event.id} className="border-t border-slate-100 transition hover:bg-slate-50">
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-bold text-slate-900">{event.name}</p>
                          <p className="mt-1 max-w-xs text-xs text-slate-500">{event.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-semibold text-slate-700">{event.quota}</td>
                      <td className="px-6 py-5 text-slate-600">{formatDate(event.started_at)}</td>
                      <td className="px-6 py-5 text-slate-600">{formatDate(event.ended_at)}</td>
                      <td className="px-6 py-5">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.badge}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(event)} className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700">
                            Edit
                          </button>
                          <button onClick={() => { setSelectedId(event.id); setShowDeleteModal(true); }} className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-600">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredEvents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Tidak ada event yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination placeholder... */}
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <div className="text-sm text-slate-500">Rows per page: 10</div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100">{"<<"}</button>
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100">{"<"}</button>
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100">{">"}</button>
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100">{">>"}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Create/Edit (sama) */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900">
              {showCreateModal ? "Create Event" : "Edit Event"}
            </h2>
            <div className="mt-6 space-y-5">
              {/* ... input fields ... */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Nama Event</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl border p-4" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Detail Event</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-2xl border p-4" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Slots Peserta</label>
                <input type="number" value={quota} onChange={(e) => setQuota(e.target.value)} className="w-full rounded-2xl border p-4" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Tanggal Mulai</label>
                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-2xl border p-4" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Tanggal Selesai</label>
                <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-2xl border p-4" />
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }} className="flex-1 rounded-xl border px-4 py-3">Cancel</button>
                <button onClick={showCreateModal ? handleCreate : handleEdit} className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-white">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900">Hapus Event?</h2>
            <p className="mt-3 text-slate-500">Event akan dihapus permanen.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 rounded-xl border px-4 py-3">Cancel</button>
              <button onClick={handleDelete} className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}