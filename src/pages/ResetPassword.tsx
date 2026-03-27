import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    }
    // Also listen for auth state with recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Le password non corrispondono"); return; }
    if (password.length < 6) { toast.error("La password deve avere almeno 6 caratteri"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success("Password aggiornata con successo!");
    navigate("/admin");
  };

  return (
    <Layout>
      <section className="section-padding bg-background min-h-[60vh] flex items-center">
        <div className="container mx-auto max-w-md">
          <div className="bg-card rounded-2xl border shadow-lg p-8">
            <h1 className="text-2xl font-heading font-bold mb-2 text-center">Reimposta Password</h1>
            {ready ? (
              <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                <div>
                  <Label>Nuova Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required minLength={6} placeholder="••••••••" />
                  </div>
                </div>
                <div>
                  <Label>Conferma Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="pl-10" required minLength={6} placeholder="••••••••" />
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Aggiornamento..." : "Aggiorna Password"}
                </Button>
              </form>
            ) : (
              <p className="text-center text-muted-foreground mt-4">Link non valido o scaduto. Richiedi un nuovo link di reset.</p>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
