import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, Mail, User, ArrowLeft } from "lucide-react";
import { sendAppEmail } from "@/lib/appEmail";

type Mode = "login" | "register" | "forgot";

export default function Auth() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [awaitingRedirect, setAwaitingRedirect] = useState(false);
  const { signIn, signUp, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const requested = params.get("redirect");
    return requested?.startsWith("/") ? requested : null;
  }, [location.search]);

  // If user is already logged in and not awaiting a form submission redirect
  useEffect(() => {
    if (authLoading || !user || awaitingRedirect) return;
    // Already logged in, redirect immediately
    navigate(redirectPath || (isAdmin ? "/admin" : "/area-associati"), { replace: true });
  }, [authLoading, user, isAdmin, navigate, redirectPath, awaitingRedirect]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const denied = params.get("denied");
    if (denied === "admin") toast.error("Non hai i permessi per accedere all'area admin.");
    if (denied === "super-admin") toast.error("Solo Il Grande P può accedere a questa sezione.");
  }, [location.search]);

  useEffect(() => {
    if (!awaitingRedirect || authLoading || !user) return;

    if (redirectPath?.startsWith("/admin") && !isAdmin) {
      toast.error("Il tuo account non ha accesso al pannello admin.");
      navigate("/area-associati", { replace: true });
      setAwaitingRedirect(false);
      return;
    }

    navigate(redirectPath || (isAdmin ? "/admin" : "/area-associati"), { replace: true });
    setAwaitingRedirect(false);
  }, [authLoading, awaitingRedirect, isAdmin, navigate, redirectPath, user]);

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
      } else if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success("Accesso effettuato!");
        setAwaitingRedirect(true);
      } else {
        const { error, user: createdUser } = await signUp(email, password, fullName);
        if (error) throw error;

        try {
          const { data: settings } = await supabase
            .from("site_settings")
            .select("email_confirm_welcome")
            .limit(1)
            .maybeSingle();

          if ((settings as any)?.email_confirm_welcome !== false && createdUser?.email) {
            await sendAppEmail({
              templateName: "welcome-member",
              recipientEmail: createdUser.email,
              idempotencyKey: `welcome-${createdUser.id}`,
              templateData: {
                fullName,
                email: createdUser.email,
              },
            });
          }
        } catch (emailError) {
          console.error("Welcome email error", emailError);
        }

        toast.success("Registrazione completata! Controlla la tua email e poi accedi.");
        setMode("login");
        setPassword("");
      }
    } catch (err: any) {
      toast.error(err.message || "Errore durante l'autenticazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
            {mode === "login" ? "Accedi" : mode === "register" ? "Registrati" : "Recupera Password"}
          </motion.h1>
          <p className="text-primary-foreground/80">
            {mode === "login" ? "Accedi alla tua area riservata" : mode === "register" ? "Crea il tuo account" : "Inserisci la tua email per ricevere il link di reset"}
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-md">
          <div className="bg-card rounded-2xl border shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "register" && (
                <div>
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Mario Rossi" className="pl-10" required />
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@esempio.it" className="pl-10" required />
                </div>
              </div>
              {mode !== "forgot" && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10" required minLength={6} />
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Caricamento..." : mode === "login" ? "Accedi" : mode === "register" ? "Registrati" : "Invia Link di Reset"}
              </Button>
            </form>
            <div className="mt-6 text-center space-y-2">
              {mode === "login" && (
                <>
                  <p className="text-xs text-muted-foreground">Gli account admin vengono reindirizzati automaticamente a /admin dopo l'accesso.</p>
                  <button onClick={() => setMode("forgot")} className="text-sm text-primary hover:underline block w-full">Password dimenticata?</button>
                  <button onClick={() => setMode("register")} className="text-sm text-primary hover:underline block w-full">Non hai un account? Registrati</button>
                </>
              )}
              {mode === "register" && (
                <button onClick={() => setMode("login")} className="text-sm text-primary hover:underline">Hai già un account? Accedi</button>
              )}
              {mode === "forgot" && (
                <button onClick={() => setMode("login")} className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto">
                  <ArrowLeft className="h-3 w-3" /> Torna al login
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
