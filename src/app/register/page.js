"use client";

import { useState } from "react";
import TextField from "@mui/material/TextField";
import { ChevronLeft } from "@mui/icons-material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { redirect } from "next/navigation";

export default function StepByStepSignup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState({ error: false, message: [], e: "" });
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    dob: "",
    gender: "",
    email: "",
    password: "",
  });
  const [passwordShow, setPasswordShow] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fetch signup POST route
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (result.success) {
      redirect("/facebook");
    } else {
      setIsSubmitting(false);
      setError({
        error: true,
        message: Array.isArray(result.error) ? result.error : [result.error || "Registration failed"],
        e: result.e,
      });
    }
  };

  return (
    <div className="max-w-sm mx-auto pt-10 p-4 text-start bg-gradient-to-b from-violet-100 to-gray-indigo-400 h-screen">
      {/* One step back icon */}
      <div className="mb-5" onClick={() => (step === 1 ? location.assign("/") : setStep(step - 1))}>
        {step === 1 ? <button className="text-[var(--secondary)] cursor-pointer">Return to sign in</button> : <ChevronLeft />}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit;
        }}
        aria-busy={isSubmitting}
      >
        {/* Step 1 - First Name and Last Name. */}
        {step === 1 && (
          <>
            <div className="mb-4">
              <h2 className="text-2xl font-bold">What is your name?</h2>
              <p className="text-sm text-gray-500">Enter the name you use in real life.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <TextField
                type="text"
                name="fname"
                value={formData.fname}
                onChange={handleChange}
                label="First Name"
                variant="filled"
                sx={{
                  "& .MuiFilledInput-root": {
                    borderRadius: "10px",
                    backgroundColor: "white",
                    border: "1px solid var(--border) ",
                  },
                  "& .MuiFilledInput-root:hover": {
                    backgroundColor: "white",
                    border: "1px solid var(--foreground)",
                  },
                  "& .MuiFilledInput-root:focus": {
                    backgroundColor: "white",
                  },
                }}
              />

              <TextField
                type="text"
                name="lname"
                value={formData.lname}
                onChange={handleChange}
                label="Surname"
                variant="filled"
                sx={{
                  "& .MuiFilledInput-root": {
                    borderRadius: "10px",
                    backgroundColor: "white",
                    border: "1px solid var(--border) ",
                  },
                  "& .MuiFilledInput-root:hover": {
                    backgroundColor: "white",
                    border: "1px solid var(--foreground)",
                  },
                  "& .MuiFilledInput-root:focus": {
                    backgroundColor: "white",
                  },
                }}
              />

              {/* Next button. This button makes sure fname and lname input fields are filled before accessing the next step */}
              <button onClick={() => formData.fname && formData.lname && setStep(2)} className="cursor-pointer bg-[var(--secondary)] hover:bg-[var(--secondary-dim)] transition-all duration-300  text-white px-4 py-2 rounded-[50px] col-span-2">
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 2 - Date of Birth */}
        {step === 2 && (
          <>
            <div className="mb-4">
              <h2 className="text-2xl font-bold">What&apos;s is your date of birth?</h2>
              <p className="text-sm text-gray-500">Choose your date of birth. You can always make this private later.</p>
            </div>

            <div className="flex flex-col gap-2">
              <TextField
                min="2007-01-01"
                max="2025-01-01"
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                variant="filled"
                sx={{
                  "& .MuiFilledInput-root": {
                    borderRadius: "10px",
                    backgroundColor: "white",
                  },
                  "& .MuiFilledInput-root:focus": {
                    backgroundColor: "white",
                  },
                }}
              />
              {error.error && error.e === "dob" && <p>{error.message}</p>}

              {/* Next button. This button makes sure date of birth input field is filled before accessing the next step */}
              <button
                onClick={() => {
                  if (!formData.dob) return;
                  const year = parseInt(String(formData.dob).slice(0, 4), 10);
                  // Check if the year part of the dob (from input type="date", e.g. "YYYY-MM-DD") is greater than 2025
                  if (year > 2025) {
                    setError({ error: true, message: "Year cannot be after 2025", e: "dob" });
                    return;
                  }
                  // Check if the year part of the dob (from input type="date", e.g. "YYYY-MM-DD") is less than 2007
                  if (year < 2007) {
                    setError({ error: true, message: "You must be at least 18 years old", e: "dob" });
                    return;
                  }
                  setError({ error: false, message: "", e: "" });
                  setStep(3);
                }}
                className="cursor-pointer bg-[var(--secondary)] hover:bg-[var(--secondary-dim)] transition-all duration-300 text-white px-4 py-2 rounded-[50px] col-span-2"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 3 - gender */}
        {step === 3 && (
          <>
            <div className="mb-4">
              <h2 className="text-2xl font-bold">What&apos;s your gender?</h2>
              <p className="text-sm text-gray-500">You can change who sees your gender on your profile later.</p>
            </div>

            <div className="bg-[var(--background)] rounded-lg shadow-md mt-4">
              <div className="block divide-y divide-slate-200">
                {["Male", "Female", "Other"].map((option) => (
                  <label key={option} className="flex justify-between p-4">
                    {option}
                    <input type="radio" name="gender" value={option} checked={formData.gender === option} onChange={handleChange} />
                  </label>
                ))}
              </div>
            </div>

            {/* Next button. This button makes sure the gender input field is filled before accessing the next step */}
            <button onClick={() => formData.gender && setStep(4)} className="mt-10 cursor-pointer bg-[var(--secondary)] hover:bg-[var(--secondary-dim)] transition-all duration-300 text-white px-4 py-2 rounded-[50px] w-full">
              Next
            </button>
          </>
        )}

        {/* Step 4 - Email */}
        {step === 4 && (
          <>
            <div className="mb-4">
              <h2 className="text-2xl font-bold">What&apos;s your email address?</h2>
              <p className="text-sm text-gray-500">Enter your email address. You can always make this private later.</p>
            </div>

            <div className="flex flex-col gap-4">
              <TextField
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                variant="filled"
                sx={{
                  "& .MuiFilledInput-root": {
                    borderRadius: "10px",
                    backgroundColor: "white",
                  },
                  "& .MuiFilledInput-root:focus": {
                    backgroundColor: "white",
                  },
                }}
              />
              {error.error && error.e === "email" && <p>{error.message}</p>}

              {/* Next button. This button makes sure the gender input field is filled before accessing the next step */}
              <button onClick={() => formData.email.includes("@") && setStep(5)} className="cursor-pointer bg-[var(--secondary)] hover:bg-[var(--secondary-dim)] transition-all duration-300 text-white px-4 py-2 rounded-[50px] col-span-2">
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 5 - Password */}
        {step === 5 && (
          <>
            <div className="mb-4">
              <h2 className="text-2xl font-bold">Choose your password</h2>
              <p className="text-sm text-gray-500">Choose a strong password.</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="relative grid">
                <TextField
                  required
                  disabled={isSubmitting}
                  className={isSubmitting ? "cursor-not-allowed opacity-50" : ""}
                  type={passwordShow ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  variant="filled"
                  label="Password"
                  sx={{
                    "& .MuiFilledInput-root": {
                      borderRadius: "10px",
                      backgroundColor: "white",
                    },
                    "& .MuiFilledInput-root:focus": {
                      backgroundColor: "white",
                    },
                  }}
                />

                {/* Show password button */}
                <button type="button" className="absolute top-4 right-2" onClick={() => setPasswordShow(!passwordShow)}>
                  {passwordShow ? <Visibility /> : <VisibilityOff />}
                </button>
              </div>

              {/* Show error message if there's any caught on the api route */}
              {error.error && error.e === "password" && <p>{error.message}</p>}

              {/* Finish button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                type="submit"
                className={`input-class ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""} cursor-pointer bg-[var(--secondary)] hover:bg-[var(--secondary-dim)] transition-all duration-300 text-white px-4 py-2 rounded-[50px]`}
              >
                {isSubmitting ? "Finishing..." : "Finish Up"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
