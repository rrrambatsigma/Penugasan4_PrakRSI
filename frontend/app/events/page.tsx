"use client"

import { useEffect, useState } from "react"

interface Event {
  id: string
  name: string
  description: string
  quota: number
  started_at: string
  ended_at: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editQuota, setEditQuota] = useState("")
  const [editStartDate, setEditStartDate] = useState("")
  const [editEndDate, setEditEndDate] = useState("")

  const fetchEvents = () => {
    fetch("http://localhost:8000/events/")
      .then((res) => res.json())
      .then((data) => setEvents(data.data))
      .catch((err) => console.error(err))
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    })
  }

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
    })
  }

  const formatInputDate = (date: string) => {
    const localDate = new Date(date)

    localDate.setMinutes(
        localDate.getMinutes() - localDate.getTimezoneOffset()
    )

    return localDate.toISOString().slice(0, 16)
    }

  const openEditModal = (event: Event) => {
    setSelectedId(event.id)
    setEditName(event.name)
    setEditDescription(event.description)
    setEditQuota(String(event.quota))
    setEditStartDate(formatInputDate(event.started_at))
    setEditEndDate(formatInputDate(event.ended_at))
    setShowEditModal(true)
  }

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token")

    if (!token) {
      alert("Token tidak ditemukan. Silakan login dulu.")
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        alert("Gagal menghapus event.")
        return
      }

      setEvents(events.filter((event) => event.id !== id))
      setShowDeleteModal(false)
    } catch {
      alert("Terjadi error saat menghapus event.")
    }
  }

  const handleEdit = async () => {
    if (!selectedId) return

    const token = localStorage.getItem("token")

    if (!token) {
      alert("Token tidak ditemukan. Silakan login dulu.")
      return
    }

    if (!editName || !editDescription || !editQuota || !editStartDate || !editEndDate) {
      alert("Semua field wajib diisi.")
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/events/${selectedId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          quota: Number(editQuota),
          start_date: `${editStartDate}:00`,
          end_date: `${editEndDate}:00`,
        }),
      })

      if (!response.ok) {
        alert("Gagal mengubah event.")
        return
      }

      setShowEditModal(false)
      fetchEvents()
    } catch {
      alert("Terjadi error saat mengubah event.")
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600">
            Acara RSI
          </p>

          <h1 className="text-5xl font-bold text-slate-900">
            Event Management
          </h1>

          <p className="mt-3 text-slate-600">
            Kelola daftar acara yang tersedia.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-700">
                  Tersedia
                </span>

                <span className="text-xs font-bold uppercase text-indigo-600">
                  {formatDate(event.started_at)}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                {event.name}
              </h2>

              <p className="mt-4 min-h-[72px] text-sm leading-6 text-slate-600">
                {event.description}
              </p>

              <div className="mt-6">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Quota Status
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  {event.quota} Slots Available
                </p>

                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div className="h-2 w-full rounded-full bg-emerald-500" />
                </div>
              </div>

              <div className="mt-6 text-xs text-slate-500">
                <p>Mulai: {formatDateTime(event.started_at)}</p>
                <p>Selesai: {formatDateTime(event.ended_at)}</p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => openEditModal(event)}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  Edit
                </button>

                <button
                  onClick={() => {
                    setSelectedId(event.id)
                    setShowDeleteModal(true)
                  }}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900">Hapus Event?</h2>

            <p className="mt-3 text-slate-600">
              Event yang dihapus tidak bisa dikembalikan lagi.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Batal
              </button>

              <button
                onClick={() => selectedId && handleDelete(selectedId)}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-600"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900">Edit Event</h2>

            <p className="mt-2 text-slate-600">
              Ubah data event lalu simpan perubahan.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block font-semibold text-slate-800">
                  Nama Event
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold text-slate-800">
                  Deskripsi
                </label>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold text-slate-800">
                  Kuota
                </label>
                <input
                  type="number"
                  className="w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={editQuota}
                  onChange={(e) => setEditQuota(e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-semibold text-slate-800">
                    Mulai
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-slate-800">
                    Selesai
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Batal
              </button>

              <button
                onClick={handleEdit}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}