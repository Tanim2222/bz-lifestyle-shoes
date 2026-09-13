import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import Modal from "../../admin/components/Modal";
import Spinner from "../../admin/components/Spinner";
import * as authService from "../../admin/services/auth.service";
import logoBZLI from "../../../assets/logo/logoBZLI.png";

// Sign-in happens via authService directly rather than the admin AuthContext
// hook — this modal renders on the storefront, outside AdminApp's
// <AuthProvider>. Supabase persists the session itself, so once we navigate
// to /admin, AdminApp's own AuthProvider picks the now-signed-in session
// straight up.
export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await authService.login(email, password);
      onClose();
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Account Login" maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center -mt-2 mb-6">
        <div className="w-14 h-14 rounded-2xl overflow-hidden mb-3 shadow-[0_0_30px_rgba(45,212,191,0.2)]">
          <img src={logoBZLI} alt="BZ Lifestyle Shoes" className="w-full h-full object-cover" />
        </div>
        <p className="text-white/50 text-sm">Sign in to manage BZ Lifestyle Shoes</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider pl-1">Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@bzlifestyle.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider pl-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all"
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
          Sign In
        </button>
      </form>
    </Modal>
  );
}
