import { Button } from "@/components/ui/button";
import Link from "next/link";

const navLinks = [
  { href: "/", label: "Browse Events", active: true },
  { href: "/features", label: "Features" },
  { href: "/schedule", label: "Schedule" },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-base font-bold text-gray-900 tracking-tight">
          Pingfest
        </Link>

        {/* Nav links */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-sm font-medium transition-colors ${
                link.active
                  ? "text-indigo-600 after:absolute after:-bottom-4.25 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600 after:content-['']"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2">
          <Link href="/auth/login">
            <Button className="bg-slate-400  hover:bg-slate-500 text-white">Login</Button>
          </Link>
          <Link href="/auth/register">
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700 px-4">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}