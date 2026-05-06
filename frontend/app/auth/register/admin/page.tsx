"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

type RegisterAdminForm = {
  first_name: string;
  last_name: string;
  whatsapp_number: string;
  username: string;
  email: string;
  password: string;
  confirm_password: string;
};

export default function RegisterAdminPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterAdminForm>({
    first_name: "",
    last_name: "",
    whatsapp_number: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.first_name.trim()) {
      toast.error("First name wajib diisi");
      return false;
    }

    if (!form.last_name.trim()) {
      toast.error("Last name wajib diisi");
      return false;
    }

    if (!form.whatsapp_number.trim()) {
      toast.error("Nomor WhatsApp wajib diisi");
      return false;
    }

    if (!form.username.trim()) {
      toast.error("Username wajib diisi");
      return false;
    }

    if (form.username.trim().length > 16) {
      toast.error("Username maksimal 16 karakter");
      return false;
    }

    if (!form.email.trim()) {
      toast.error("Email wajib diisi");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      toast.error("Format email tidak valid");
      return false;
    }

    if (!form.password.trim()) {
      toast.error("Password wajib diisi");
      return false;
    }

    if (form.password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return false;
    }

    const hasUppercase = /[A-Z]/.test(form.password);

    if (!hasUppercase) {
      toast.error("Password harus mengandung minimal 1 huruf besar");
      return false;
    }

    if (form.password !== form.confirm_password) {
      toast.error("Konfirmasi password tidak sama");
      return false;
    }

    return true;
  };

  const handleRegisterAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/register/admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
            whatsapp_number: form.whatsapp_number.trim(),
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          data?.detail?.message ||
          data?.detail ||
          data?.message ||
          "Registrasi admin gagal. Periksa kembali data yang dimasukkan.";

        toast.error(errorMessage);
        return;
      }

      toast.success(
        "Akun admin berhasil dibuat! Kamu akan diarahkan ke halaman login."
      );

      setForm({
        first_name: "",
        last_name: "",
        whatsapp_number: "",
        username: "",
        email: "",
        password: "",
        confirm_password: "",
      });

      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (error) {
      toast.error("Tidak dapat terhubung ke server backend");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_32%),linear-gradient(to_bottom,#ffffff,#f8fafc)] px-4 py-8 font-sans text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] lg:grid-cols-[0.8fr_1.2fr]">
          <section className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-10 text-white lg:flex lg:flex-col">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.10)_0%,transparent_38%,rgba(79,70,229,0.18)_100%)]" />

            <div className="relative">
              <Link
                href="/"
                className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                ← Kembali ke Beranda
              </Link>

              <div className="mt-20">
                <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-200">
                  Admin Access
                </p>

                <h1 className="mt-5 max-w-md text-4xl font-extrabold leading-tight tracking-tight">
                  Buat akun admin untuk akses pengelolaan sistem.
                </h1>

                <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
                  Akun admin digunakan untuk mengakses fitur pengelolaan event,
                  data akun, dan kebutuhan manajemen sistem Acara RSI.
                </p>
              </div>
            </div>
          </section>

          <section className="px-6 py-8 sm:px-8 lg:px-12 lg:py-10">
            <div className="mb-8">
              <Link
                href="/"
                className="mb-8 inline-flex text-sm font-semibold text-slate-700 transition hover:text-indigo-700 lg:hidden"
              >
                ← Kembali ke Beranda
              </Link>

              <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
                  Register Admin
                </p>

                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
                  Buat Akun Admin
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Lengkapi data berikut untuk membuat akun dengan akses admin.
                </p>
              </div>
            </div>

            <form onSubmit={handleRegisterAdmin} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="first_name"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    First Name
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={form.first_name}
                    onChange={handleChange}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-800 focus:bg-white focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="last_name"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Last Name
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={form.last_name}
                    onChange={handleChange}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-800 focus:bg-white focus:ring-4 focus:ring-slate-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="whatsapp_number"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Nomor WhatsApp
                </label>
                <input
                  id="whatsapp_number"
                  name="whatsapp_number"
                  type="text"
                  value={form.whatsapp_number}
                  onChange={handleChange}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-800 focus:bg-white focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="username"
                    className="block text-sm font-bold text-slate-700"
                  >
                    Username
                  </label>

                  <span className="text-xs font-medium text-slate-400">
                    {form.username.length}/16
                  </span>
                </div>

                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  maxLength={16}
                  onChange={handleChange}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-800 focus:bg-white focus:ring-4 focus:ring-slate-100"
                />

                <p className="mt-2 text-xs font-medium text-slate-500">
                  Username maksimal 16 karakter.
                </p>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-800 focus:bg-white focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-800 focus:bg-white focus:ring-4 focus:ring-slate-100"
                  />
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    Minimal 8 karakter dan memiliki huruf besar.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirm_password"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Konfirmasi Password
                  </label>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-800 focus:bg-white focus:ring-4 focus:ring-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex h-12 w-full items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-extrabold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-indigo-300 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:hover:translate-y-0"
              >
                {isLoading ? "Memproses Akun Admin..." : "Register Admin"}
              </button>
            </form>

            <div className="mt-7 flex flex-col items-center justify-center gap-2 text-center text-sm text-slate-600 sm:flex-row">
              <span>Sudah punya akun admin?</span>
              <Link
                href="/auth/login"
                className="font-extrabold text-indigo-600 transition hover:text-indigo-700 hover:underline"
              >
                Login di sini
              </Link>
            </div>

            <p className="mt-4 text-center text-xs font-medium text-slate-400">
              Halaman ini digunakan untuk membuat akun dengan role admin.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}