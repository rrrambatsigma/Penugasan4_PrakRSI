"use client";

import { loginUser } from "@/lib/services/authService";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import Link from "next/link";
import { TextInput } from "../atoms/TextInput";
import { Lock, User, AlertCircle, CheckCircle, CircleUser } from "lucide-react";

export const LoginTemplate = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await loginUser({
        identifier: formData.identifier,
        password: formData.password,
      });

      // 1. Ambil role dari response backend
      const userRole = response.data.role; 

      // 2. Tentukan tujuan: admin ke /dashboard, user ke halaman utama (/)
      const destination = userRole === "ADMIN" ? "/dashboard" : "/";
      
      // 3. Update pesan sukses agar lebih sesuai
      const displayRole = userRole === "ADMIN" ? "Admin" : "Peserta";
      setSuccess(`Login berhasil sebagai ${displayRole}! Mengarahkan...`);

      setFormData({ identifier: "", password: "" });

      // 4. Jalankan redirect
      setTimeout(() => {
        router.push(destination);
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login gagal";
      setError(errorMessage);
      console.log("Login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-blue-50 p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Left Side - Branding Section (Hidden on Mobile) */}
          <div className="hidden lg:flex lg:flex-col justify-between bg-blue-600 p-8 xl:p-12 text-white">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                <span className="text-xl font-bold">AR</span>
              </div>
              <span className="text-xl font-bold">Acara-RSI!</span>
            </div>
            <div className="h-full w-full flex space-y-6">
              <div>
                <p className="w-full text-blue-200 text-lg sm:text-xl font-semibold tracking-wide mb-3 mt-1">
                  Selamat datang di Acara-RSI, platform resmi untuk pendaftaran dan manajemen acara di lingkungan RSI!
                </p>
                <h1 className="w-1/3 text-3xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                  Halo, Selamat Datang!
                </h1>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="flex items-center justify-center p-6 sm:p-8 lg:p-8">
            <div className="w-full max-w-sm">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Login
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Bergabunglah dengan Acara-RSI hari ini
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* identifier */}
                <TextInput
                  id="identifier"
                  name="identifier"
                  label="Email atau Username"
                  type="text"
                  placeholder="johndoe@example.com"
                  value={formData.identifier}
                  onChange={handleChange}
                  icon={CircleUser}
                  autoComplete="email"
                  required
                  disabled={isLoading}
                />

                {/* Password */}
                <TextInput
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  icon={Lock}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                />

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !!success}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-2.5 rounded-lg font-semibold transition-colors text-sm sm:text-base mt-6"
                >
                  {isLoading ? "Logging in..." : "Masuk"}
                </Button>
              </form>

              {/* Login Link */}
              <p className="text-center text-xs sm:text-sm text-gray-600 mt-6">
                Belum punya akun?{" "}
                <Link
                  href="/auth/register"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Daftar di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};