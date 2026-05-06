import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-slate-900">
          Event App
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/auth/register"
            className="text-sm font-medium text-slate-700 hover:text-slate-950"
          >
            Register
          </Link>

          <Link
            href="/auth/login"
            className="text-sm font-medium text-slate-700 hover:text-slate-950"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}