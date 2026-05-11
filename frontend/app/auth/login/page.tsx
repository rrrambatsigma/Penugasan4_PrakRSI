"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { SyntheticEvent } from "react"

export default function LoginPage() {
  const router = useRouter()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!identifier || !password) {
      alert("Email/username dan password wajib diisi")
      return
    }

    setLoading(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.detail?.message || data.message || "Login gagal")
        return
      }

      localStorage.setItem("token", data.data.access_token)
      localStorage.setItem("refresh_token", data.data.refresh_token)

      alert("Login berhasil!")
      router.push("/admin/events")
    } catch (error) {
      console.error(error)
      alert("Terjadi kesalahan saat login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-4xl items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl">

          <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">
            Acara RSI
          </p>

          <h1 className="mt-5 text-center text-4xl font-extrabold tracking-tight text-slate-950">
            Login
          </h1>

          <p className="mt-3 text-center text-slate-500">
            Masuk sebagai admin untuk mengelola event.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Username / Email
              </label>

              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Masukkan username atau email"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Login"}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-extrabold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
            >
              Register
            </Link>

            <Link
              href="/"
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-extrabold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
            >
              Beranda
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}