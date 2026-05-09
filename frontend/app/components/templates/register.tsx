"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TextInput } from "../atoms/TextInput";
import { registerUser } from "@/lib/services/authService";

export const RegisterTemplate = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    whatsappNumber: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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
      const response = await registerUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        email: formData.email,
        whatsapp_number: formData.whatsappNumber,
        password: formData.password,
      });

      setSuccess("Registrasi berhasil! Redirecting ke halaman login...");
      console.log("Registration successful:", response);

      setFormData({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        whatsappNumber: "",
        password: "",
      });

      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat registrasi. Silakan coba lagi.";
      setError(errorMessage);
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-blue-50 p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="h-min-3/4 grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Left Side - Branding Section (Hidden on Mobile) */}
          <div className="hidden lg:flex lg:flex-col justify-between bg-blue-600 p-8 xl:p-12 text-white">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                <span className="text-xl font-bold">EH</span>
              </div>
              <span className="text-xl font-bold">Event Hub</span>
            </div>
            <div className="h-full w-full flex space-y-6">
              <div>
                <p className="w-full text-blue-200 text-lg sm:text-xl font-semibold tracking-wide mb-3 mt-12">
                  EVENT MANAGEMENT
                </p>
                <h1 className="w-1/3 text-3xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                  Connect Learn Grow
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
                  Daftar Akun Baru
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Bergabunglah dengan Event Hub hari ini
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
                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <TextInput
                    id="firstName"
                    name="firstName"
                    label="Nama Depan"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                  <TextInput
                    id="lastName"
                    name="lastName"
                    label="Nama Belakang"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Username */}
                <TextInput
                  id="username"
                  name="username"
                  label="Username"
                  placeholder="john_doe"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />

                {/* Email */}
                <TextInput
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  icon={Mail}
                  autoComplete="email"
                  required
                  disabled={isLoading}
                />

                {/* WhatsApp Number */}
                <TextInput
                  id="whatsapp-number"
                  name="whatsappNumber"
                  label="WhatsApp Number"
                  type="tel"
                  placeholder="+62 123 456 789"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  icon={Phone}
                  autoComplete="tel"
                  required
                  disabled={isLoading}
                />

                {/* Password */}
                <TextInput
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  icon={Lock}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                />

                {/* Register Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !!success}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-2.5 rounded-lg font-semibold transition-colors text-sm sm:text-base mt-6"
                >
                  {isLoading ? "Mendaftar..." : "Daftar Akun"}
                </Button>
              </form>

              {/* Login Link */}
              <p className="text-center text-xs sm:text-sm text-gray-600 mt-6">
                Sudah punya akun?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};