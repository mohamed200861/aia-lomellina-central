import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, Mail, ShieldCheck, ArrowLeft } from "lucide-react";

type Mode = "login" | "forgot";

export default function AdminLogin() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const requested = params.get("redirect");
    return requested?.startsWith("/admin") ? requested : "/admin";
  }, [location.search]);

  // If already logged in as admin, go to /admin
  useEffect(() => {
    if (authLoading || !user) return;
    if (isAdmin) {
      navigate(redirectPath, { replace: true });
      return;
    }
    toast.error("Accesso negato. Questo login è riservato agli amministratori.");
    navigate("/area-associati", { replace: true });
  }, [authLoading, user, isAdmin, navigate, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Email di reset inviata! Controlla la tua casella.");
        setMode("login");
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message || "Errore durante l'autenticazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/30 mb-4">
            <ShieldCheck className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Pannello Amministrazione</h1>
          <p className="text-blue-300/70 text-sm mt-1">AIA Sezione Lomellina — Accesso Riservato</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="admin-email" className="text-blue-100">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-400/60" />
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@esempio.it"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {mode === "login" && (
              <div>
                <Label htmlFor="admin-password" className="text-blue-100">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400/60" />
                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              size="lg"
              disabled={loading}
            >
              {loading
                ? "Caricamento..."
                : mode === "login"
                ? "Accedi al Pannello"
                : "Invia Link di Reset"}
            </Button>
          </form>

          <div className="mt-5 text-center">
            {mode === "login" ? (
              <button
                onClick={() => setMode("forgot")}
                className="text-sm text-blue-400/70 hover:text-blue-300 transition-colors"
              >
                Password dimenticata?
              </button>
            ) : (
              <button
                onClick={() => setMode("login")}
                className="text-sm text-blue-400/70 hover:text-blue-300 flex items-center gap-1 mx-auto transition-colors"
              >
                <ArrowLeft className="h-3 w-3" /> Torna al login
              </button>
            )}
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center mt-6 text-white/30 text-xs">
          Non sei un amministratore?{" "}
          <a href="/login" className="text-blue-400/60 hover:text-blue-300 underline">
            Accesso Area Associati
          </a>
        </p>
      </motion.div>
    </div>
  );
}
