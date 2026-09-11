"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { LoaderCircle, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [authLoading, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/dashboard");
    } catch {
      setError("Login gagal. Periksa email dan password");
    } finally {
      setLoading(false);
    }
  }
 return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-9">
          <div className="mb-8">
            <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-indigo-600 text-white">
              <LogIn size={22} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">Masuk MiniPOS</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Gunakan akun yang dibuat melalui Firebase Authentication.</p>
          </div>

          <form className="grid gap-5" onSubmit={handleSubmit}>
            <Input label="Email" type="email" placeholder="siswa@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Password" type="password" placeholder="Minimal 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} />

            {error && <div className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}

            <Button type="submit" disabled={loading}>
              {loading && <LoaderCircle size={18} className="animate-spin" />}
              {loading ? "Memproses..." : "Login"}
            </Button>
          </form>
        </div>
      </main>
    );
  }

