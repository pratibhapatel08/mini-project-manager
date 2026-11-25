"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FolderKanban, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { authLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(loginUser(formData)).unwrap();
      router.push("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-xl">
            <FolderKanban size={30} className="text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-slate-900">
          Welcome Back
        </h1>

        <p className="text-slate-500 text-center mt-2 mb-8">
          Sign in to manage your projects
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-400" size={19} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={19} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            {authLoading ? "Signing in..." : "Sign In"}
            {!authLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-7">
          Don't have an account?{" "}
          <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </main>
  );
}

