import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-4xl items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">
            Acara RSI
          </p>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950">
            Login
          </h1>

          <p className="mt-4 text-base font-medium text-slate-500">
            Coming soon.
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Halaman login belum dibuat.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className="flex-1 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
            >
              Ke Register
            </Link>

            <Link
              href="/"
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
            >
              Ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}