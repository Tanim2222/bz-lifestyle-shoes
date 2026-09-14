import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, CheckCircle2 } from "lucide-react";
import { supabase } from "../admin/services/supabaseClient";
import * as customerAuthService from "../services/customerAuth.service";
import Spinner from "../admin/components/Spinner";
import logoBZLI from "../../assets/logo/logoBZLI.png";

const inputClass =
  "w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all";

// Reached from the "reset your password" email — Supabase's client parses the
// recovery token out of the URL on load and starts a short-lived recovery
// session here (fired as the PASSWORD_RECOVERY auth event), which is all
// updateUser() below needs to actually change the password. Works the same
// for customer and admin accounts since both live in Supabase Auth.
export default function ResetPassword() {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsReady(true);
    });

    // Covers a page refresh after the recovery session was already
    // established, where the event above won't fire again.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setIsReady(true);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await customerAuthService.updatePassword(password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset your password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl overflow-hidden mb-3 shadow-[0_0_30px_rgba(45,212,191,0.2)]">
            <img src={logoBZLI} alt="BZ Lifestyle Shoes" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-white font-bold text-lg">Reset Password</h1>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 text-center bg-white/5 border border-white/10 rounded-2xl p-6">
            <CheckCircle2 className="w-10 h-10 text-teal-400" />
            <p className="text-sm text-white/70">Your password has been updated.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-1 w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-black font-bold text-sm cursor-pointer"
            >
              Back to BZ Lifestyle Shoes
            </button>
          </div>
        ) : !isReady ? (
          <div className="flex flex-col items-center gap-3 text-center bg-white/5 border border-white/10 rounded-2xl p-6">
            <Spinner className="w-5 h-5" />
            <p className="text-xs text-white/40">Verifying your reset link…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider pl-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider pl-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-black font-bold text-sm flex items-center justify-center gap-2 hover:from-teal-300 hover:to-cyan-300 transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoading && <Spinner className="w-4 h-4 border-black/30 border-t-black" />}
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
