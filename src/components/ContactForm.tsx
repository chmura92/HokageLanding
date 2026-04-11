"use client";

import { useState, FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed");

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 md:p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
        {/* Green checkmark */}
        <svg
          className="w-16 h-16 text-green-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-white text-lg font-semibold">
          Message sent! I&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 md:p-8"
    >
      <div className="space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm text-gray-400 mb-1.5">
            Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/20 transition-colors"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm text-gray-400 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/20 transition-colors"
            required
          />
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm text-gray-400 mb-1.5"
          >
            Message
          </label>
          <textarea
            id="message"
            placeholder="Tell me about your project..."
            value={formData.message}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, message: e.target.value }))
            }
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue/20 transition-colors min-h-[120px] resize-none"
            required
          />
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-accent-blue hover:bg-accent-blue/80 text-white px-6 py-3 rounded-lg font-semibold transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>

      {/* Error message */}
      {status === "error" && (
        <p className="text-red-400 text-sm mt-3 text-center">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
