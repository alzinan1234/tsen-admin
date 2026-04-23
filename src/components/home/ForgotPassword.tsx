// app/admin/forgot-password/page.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { adminForgotPassword, adminResetPassword } from "@/components/adminApiClient";

// ─── Step types ────────────────────────────────────────────────────────────────
type Step = "email" | "otp" | "newPassword" | "success";

// ─── OTP Input Component ───────────────────────────────────────────────────────
const OtpInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const LENGTH = 6;
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(LENGTH, " ").split("").slice(0, LENGTH);

  const handleChange = (idx: number, char: string) => {
    const cleaned = char.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = cleaned;
    const newVal = next.join("").replace(/ /g, "");
    onChange(newVal);
    if (cleaned && idx < LENGTH - 1) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[idx]?.trim() && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, LENGTH);
    onChange(pasted);
    const nextFocusIdx = Math.min(pasted.length, LENGTH - 1);
    inputs.current[nextFocusIdx]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center w-full">
      {Array.from({ length: LENGTH }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx]?.trim() || ""}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-[20px] font-semibold border border-[#E5E5E5] rounded-[10px] focus:border-[#3448D6] focus:ring-2 focus:ring-[#3448D6]/20 transition-all outline-none text-[#000000] caret-[#3448D6]"
        />
      ))}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const AdminForgotPassword = () => {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await adminForgotPassword(email);
      if (res.success) {
        setStep("otp");
        setResendCooldown(60);
      } else {
        setError(res.message || "Failed to send OTP.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);
    try {
      await adminForgotPassword(email);
      setResendCooldown(60);
      setOtp("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    setError("");
    setStep("newPassword");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await adminResetPassword(email, otp, newPassword);
      if (res.success) {
        setStep("success");
      } else {
        setError(res.message || "Password reset failed.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Shared Wrapper ────────────────────────────────────────────────────────

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="bg-white p-12 md:p-16 rounded-[16px] shadow-lg w-full max-w-[560px] flex flex-col items-start font-sans antialiased border border-gray-100">
        {/* Logo */}
        <div className="flex items-center mb-10">
          <Image
            src="/oped (2).png"
            alt="OPED Logo"
            width={100}
            height={80}
            className="mr-3"
          />
        </div>

        {children}

        {/* Footer */}
        <div className="w-full flex justify-between mt-12 text-[12px] text-[#8C8C8C] border-t border-gray-100 pt-6">
          <p className="font-light">© 2026. OPED. All rights reserved.</p>
          <a
            href="#"
            className="text-[#3448D6] font-serif font-light hover:underline"
          >
            Terms & Conditions
          </a>
        </div>
      </div>
    </div>
  );

  // ── Error Banner ──────────────────────────────────────────────────────────
  const ErrorBanner = () =>
    error ? (
      <div className="w-full mb-5 px-4 py-3 rounded-[8px] bg-red-50 border border-red-200 text-[13px] text-red-600">
        {error}
      </div>
    ) : null;

  // ── Submit Button ─────────────────────────────────────────────────────────
  const SubmitButton = ({
    label,
    loadingLabel,
  }: {
    label: string;
    loadingLabel: string;
  }) => (
    <button
      type="submit"
      disabled={loading}
      className="w-full h-12 rounded-[25px] text-white text-[16px] font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#3448D6] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        background:
          "linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)",
      }}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {loading ? loadingLabel : label}
    </button>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 1 – Enter Email
  // ══════════════════════════════════════════════════════════════════════════
  if (step === "email") {
    return (
      <Wrapper>
        <button
          onClick={() => router.push("/admin/login")}
          className="flex items-center gap-1.5 text-[13px] text-[#8C8C8C] hover:text-[#3448D6] mb-6 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Login
        </button>

        <h1 className="font-serif text-[28px] font-semibold text-[#000000] mb-3">
          Forgot Password?
        </h1>
        <p className="font-sans text-[14px] text-[#636363] mb-8 font-light">
          Enter your admin email address and we'll send you a one-time password
          to reset your account.
        </p>

        <ErrorBanner />

        <form onSubmit={handleSendOtp} className="w-full">
          <div className="mb-8 flex flex-col items-start w-full">
            <label className="font-serif text-[14px] text-[#000000] mb-2 font-medium">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@premiumpress.com"
              required
              className="w-full h-12 px-4 border border-[#E5E5E5] rounded-[8px] text-[14px] font-light placeholder-[#B5B5B5] focus:border-[#3448D6] focus:ring-1 focus:ring-[#3448D6] transition-colors outline-none"
            />
          </div>

          <SubmitButton label="Send OTP" loadingLabel="Sending OTP..." />
        </form>
      </Wrapper>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 2 – Enter OTP
  // ══════════════════════════════════════════════════════════════════════════
  if (step === "otp") {
    return (
      <Wrapper>
        <button
          onClick={() => {
            setStep("email");
            setError("");
            setOtp("");
          }}
          className="flex items-center gap-1.5 text-[13px] text-[#8C8C8C] hover:text-[#3448D6] mb-6 transition-colors"
        >
          <ArrowLeft size={15} />
          Change Email
        </button>

        {/* Email badge */}
        <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-[#F5F7FF] rounded-[8px] border border-[#E8ECFF]">
          <Mail size={15} className="text-[#3448D6]" />
          <span className="text-[13px] text-[#3448D6] font-medium">{email}</span>
        </div>

        <h1 className="font-serif text-[28px] font-semibold text-[#000000] mb-3">
          Verify OTP
        </h1>
        <p className="font-sans text-[14px] text-[#636363] mb-8 font-light">
          Enter the 6-digit code sent to your email address.
        </p>

        <ErrorBanner />

        <form onSubmit={handleVerifyOtp} className="w-full">
          <div className="mb-8">
            <OtpInput value={otp} onChange={setOtp} />
          </div>

          {/* Resend */}
          <div className="flex justify-center mb-6">
            {resendCooldown > 0 ? (
              <p className="text-[13px] text-[#8C8C8C] font-light">
                Resend code in{" "}
                <span className="text-[#3448D6] font-medium">
                  {resendCooldown}s
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-[13px] text-[#3448D6] hover:underline font-medium disabled:opacity-50"
              >
                Didn't receive the code? Resend
              </button>
            )}
          </div>

          <SubmitButton label="Verify OTP" loadingLabel="Verifying..." />
        </form>
      </Wrapper>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 3 – Set New Password
  // ══════════════════════════════════════════════════════════════════════════
  if (step === "newPassword") {
    return (
      <Wrapper>
        <button
          onClick={() => {
            setStep("otp");
            setError("");
          }}
          className="flex items-center gap-1.5 text-[13px] text-[#8C8C8C] hover:text-[#3448D6] mb-6 transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <h1 className="font-serif text-[28px] font-semibold text-[#000000] mb-3">
          Set New Password
        </h1>
        <p className="font-sans text-[14px] text-[#636363] mb-8 font-light">
          Choose a strong new password for your admin account.
        </p>

        <ErrorBanner />

        <form onSubmit={handleResetPassword} className="w-full">
          {/* New Password */}
          <div className="mb-5 flex flex-col items-start w-full">
            <label className="font-serif text-[14px] text-[#000000] mb-2 font-medium">
              New Password
            </label>
            <div className="relative w-full">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                className="w-full h-12 px-4 pr-12 border border-[#E5E5E5] rounded-[8px] text-[14px] font-light placeholder-[#B5B5B5] focus:border-[#3448D6] focus:ring-1 focus:ring-[#3448D6] transition-colors outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-8 flex flex-col items-start w-full">
            <label className="font-serif text-[14px] text-[#000000] mb-2 font-medium">
              Confirm Password
            </label>
            <div className="relative w-full">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                className="w-full h-12 px-4 pr-12 border border-[#E5E5E5] rounded-[8px] text-[14px] font-light placeholder-[#B5B5B5] focus:border-[#3448D6] focus:ring-1 focus:ring-[#3448D6] transition-colors outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Match indicator */}
            {confirmPassword.length > 0 && (
              <p
                className={`mt-1.5 text-[12px] ${
                  newPassword === confirmPassword
                    ? "text-green-500"
                    : "text-red-400"
                }`}
              >
                {newPassword === confirmPassword
                  ? "✓ Passwords match"
                  : "Passwords do not match"}
              </p>
            )}
          </div>

          <SubmitButton label="Reset Password" loadingLabel="Resetting..." />
        </form>
      </Wrapper>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 4 – Success
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <Wrapper>
      <div className="w-full flex flex-col items-center py-6">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6">
          <CheckCircle2 size={36} className="text-green-500" strokeWidth={1.5} />
        </div>

        <h1 className="font-serif text-[28px] font-semibold text-[#000000] mb-3 text-center">
          Password Reset!
        </h1>
        <p className="font-sans text-[14px] text-[#636363] mb-10 font-light text-center max-w-[340px]">
          Your password has been reset successfully. You can now log in with
          your new password.
        </p>

        <button
          onClick={() => router.push("/admin/login")}
          className="w-full h-12 rounded-[25px] text-white text-[16px] font-semibold flex items-center justify-center transition-opacity hover:opacity-90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#3448D6] focus:ring-offset-2"
          style={{
            background:
              "linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)",
          }}
        >
          Back to Login
        </button>
      </div>
    </Wrapper>
  );
};

export default AdminForgotPassword;