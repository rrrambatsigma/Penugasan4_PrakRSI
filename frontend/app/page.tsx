import Link from "next/link";

const events = [
  {
    title: "UI/UX Competition",
    description:
      "Ciptakan pengalaman pengguna yang intuitif dan estetis. Desainmu bisa mengubah cara orang berinteraksi dengan teknologi.",
    date: "May 10, 2026",
    quota: "113 / 200 Left",
    status: "Tersedia",
    statusColor: "bg-emerald-100 text-emerald-700",
    progressColor: "bg-emerald-500",
    progressWidth: "w-[56%]",
  },
  {
    title: "Competitive Programming",
    description:
      "Uji ketajaman logika dan kecepatan algoritmamu. Selesaikan masalah kompleks dalam tekanan waktu.",
    date: "May 12, 2026",
    quota: "8 / 50 Left",
    status: "Hampir Penuh",
    statusColor: "bg-orange-100 text-orange-700",
    progressColor: "bg-orange-500",
    progressWidth: "w-[84%]",
  },
  {
    title: "Data Science Competition",
    description:
      "Olah data menjadi insight berharga. Bangun model prediktif terbaik dan buktikan kemampuan analisismu.",
    date: "May 14, 2026",
    quota: "2 / 40 Left",
    status: "Hampir Penuh",
    statusColor: "bg-orange-100 text-orange-700",
    progressColor: "bg-orange-500",
    progressWidth: "w-[95%]",
  },
  {
    title: "Mobile Legends",
    description:
      "Buktikan skill Mobile Legends-mu bersama tim terbaik. Bertarung menuju podium juara di arena esports.",
    date: "May 16, 2026",
    quota: "Sold Out",
    status: "Penuh",
    statusColor: "bg-gray-200 text-gray-600",
    progressColor: "bg-gray-400",
    progressWidth: "w-full",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Acara RSI
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
            <a href="#events" className="text-indigo-600">
              Browse Event
            </a>
            <a href="#features" className="transition hover:text-indigo-600">
              Features
            </a>
            <a href="#schedule" className="transition hover:text-indigo-600">
              Schedule
            </a>
          </div>

          <div className="flex items-center gap-3">
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
                <span className="text-xs transition group-hover:rotate-180">
                  ▼
                </span>
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
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-10 pt-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
          Discover Competition Events
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500 md:text-lg">
          Curated competitions tailored to your skills and passion.
        </p>

        <div className="mx-auto mt-8 max-w-xl">
          <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <span className="mr-3 text-slate-400">⌕</span>
            <input
              type="text"
              placeholder="Search by name or category..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </section>

      <section id="events" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-8 flex flex-wrap gap-3">
          <button className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm">
            Semua
          </button>
          <button className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600">
            Tersedia
          </button>
          <button className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600">
            Hampir Penuh
          </button>
          <button className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600">
            Penuh
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <article
              key={event.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${event.statusColor}`}
                >
                  {event.status}
                </span>

                <span className="text-xs font-bold uppercase text-indigo-500">
                  {event.date}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-950">
                {event.title}
              </h2>

              <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-500">
                {event.description}
              </p>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Quota Status
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {event.quota}
                </p>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${event.progressColor} ${event.progressWidth}`}
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link
                  href="/auth/register"
                  className="rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  Daftar Sekarang
                </Link>

                <button className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600">
                  Detail Event
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}