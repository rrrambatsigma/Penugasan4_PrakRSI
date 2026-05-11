"use client"

import { useState } from "react"

export default function AddEventPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [quota, setQuota] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const [loading, setLoading] = useState(false)

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage(text)
    setMessageType(type)

    setTimeout(() => {
      setMessage("")
      setMessageType("")
    }, 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !description.trim() || !quota || !startDate || !endDate) {
      showMessage("Semua field wajib diisi.", "error")
      return
    }

    const quotaNumber = Number(quota)

    if (isNaN(quotaNumber) || quotaNumber <= 0) {
      showMessage("Kuota tidak boleh 0. Masukkan minimal 1 peserta.", "error")
      return
    }

    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start < now) {
      showMessage("Tanggal mulai tidak boleh tanggal atau waktu yang sudah lewat.", "error")
      return
    }

    if (end < now) {
      showMessage("Tanggal selesai tidak boleh tanggal atau waktu yang sudah lewat.", "error")
      return
    }

    if (end <= start) {
      showMessage("Tanggal selesai harus lebih akhir dari tanggal mulai.", "error")
      return
    }

    const token = localStorage.getItem("token")

    if (!token) {
      showMessage("Silakan login sebagai admin terlebih dahulu.", "error")
      return
    }

    try {
      setLoading(true)

      const response = await fetch("http://localhost:8000/events/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          quota: quotaNumber,
          start_date: `${startDate}:00`,
          end_date: `${endDate}:00`,
        }),
      })

      if (!response.ok) {
        showMessage("Event gagal ditambahkan.", "error")
        return
      }

      showMessage("Event berhasil ditambahkan!", "success")

      setName("")
      setDescription("")
      setQuota("")
      setStartDate("")
      setEndDate("")
    } catch {
      showMessage("Terjadi masalah saat menghubungkan ke server.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600">
            Admin Event
          </p>

          <h1 className="text-5xl font-bold text-slate-900">
            Add Event
          </h1>

          <p className="mt-3 text-slate-600">
            Tambahkan acara baru yang akan tampil di daftar event.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {message && (
            <div
              className={`mb-6 rounded-2xl px-4 py-3 text-sm font-semibold ${
                messageType === "success"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {messageType === "success" ? "✅ " : "⚠️ "}
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block font-semibold text-slate-800">
                Nama Event
              </label>
              <input
                className="w-full rounded-2xl border border-slate-200 p-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Contoh: Workshop Data Science"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-slate-800">
                Deskripsi
              </label>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-slate-200 p-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Masukkan deskripsi event"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-slate-800">
                Kuota
              </label>
              <input
                type="number"
                min="1"
                className="w-full rounded-2xl border border-slate-200 p-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Contoh: 80"
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-semibold text-slate-800">
                  Mulai
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-2xl border border-slate-200 p-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold text-slate-800">
                  Selesai
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-2xl border border-slate-200 p-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-indigo-600 p-4 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {loading ? "Menyimpan..." : "Tambah Event"}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}