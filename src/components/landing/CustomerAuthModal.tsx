import { useState, type FormEvent } from "react";
import { Mail, Lock, User as UserIcon, Phone } from "lucide-react";
import Modal from "../../admin/components/Modal";
import Spinner from "../../admin/components/Spinner";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import * as customerAuthService from "../../services/customerAuth.service";
import logoBZLI from "../../../assets/logo/logoBZLI.png";

const inputClass =
  "w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all";

export default function CustomerAuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signIn, signUp } = useCustomerAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const reset = () => {
    setName("");
    setPhone("");
    setEmail("");
    setPassword("");
    setError("");
    setResetSent(false);
  };

  const handleClose = () => {
    reset();
    setMode("signin");
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
        handleClose();
      } else if (mode === "signup") {
        await signUp(name, email, password, phone);
        handleClose();
      } else {
        await customerAuthService.requestPasswordReset(email);
        setResetSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Reset Password"}
      maxWidth="max-w-sm"
    >
      <div className="flex flex-col items-center text-center -mt-2 mb-6">
        <div className="w-14 h-14 rounded-2xl overflow-hidden mb-3 shadow-[0_0_30px_rgba(45,212,191,0.2)]">
          <img src={logoBZLI} alt="BZ Lifestyle Shoes" className="w-full h-full object-cover" />
        </div>
        <p className="text-white/50 text-sm">
          {mode === "signin"
            ? "Sign in to track orders and save your addresses"
            : mode === "signup"
              ? "Join BZ Lifestyle Shoes"
              : "We'll email you a link to set a new password"}
        </p>
      </div>

      {mode === "forgot" && resetSent ? (
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-white/70 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            Check <span className="text-white font-medium">{email}</span> for a password reset link.
          </p>
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setResetSent(false);
            }}
            className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "signup" && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider pl-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Dela Cruz" className={inputClass} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider pl-1">Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63 9XX XXX XXXX" className={inputClass} />
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider pl-1">Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
          </div>
        </div>

        {mode !== "forgot" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider pl-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                required
                type="password"
                minLength={mode === "signup" ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {mode === "signin" && (
          <button
            type="button"
            onClick={() => {
              setError("");
              setMode("forgot");
            }}
            className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer text-right -mt-2"
          >
            Forgot password?
          </button>
        )}

        {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-black font-bold text-sm flex items-center justify-center gap-2 hover:from-teal-300 hover:to-cyan-300 transition-all cursor-pointer disabled:opacity-60"
        >
          {isLoading && <Spinner className="w-4 h-4 border-black/30 border-t-black" />}
          {mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
        </button>

        <button
          type="button"
          onClick={() => {
            setError("");
            setMode(mode === "signin" ? "signup" : "signin");
          }}
          className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </form>
      )}
    </Modal>
  );
}
