import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { sendAppEmail } from "@/lib/appEmail";

export default function MembersJustify() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { data: rtos } = useQuery({
    queryKey: ["rto-for-justify"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rto_dates").select("*").eq("is_published", true).gte("rto_date", new Date().toISOString().split("T")[0]).order("rto_date");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const submissionId = crypto.randomUUID();
    const fullName = fd.get("full_name") as string;
    const reason = fd.get("reason") as string;
    const rtoDateId = fd.get("rto_date_id") as string || null;

    const { error } = await supabase.from("absence_justifications").insert({
      id: submissionId,
      user_id: user!.id,
      full_name: fullName,
      rto_date_id: rtoDateId,
      reason,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }

    try {
      const [{ data: notificationSettings }, selectedRto] = await Promise.all([
        supabase
          .from("site_settings")
          .select("notification_email_primary, notification_email_secondary, email_confirm_absence")
          .limit(1)
          .maybeSingle(),
        rtoDateId
          ? supabase.from("rto_dates").select("title, rto_date").eq("id", rtoDateId).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      const configuredSettings = (notificationSettings as any) || {};
      const adminRecipients = [configuredSettings.notification_email_primary, configuredSettings.notification_email_secondary].filter(Boolean);

      await Promise.allSettled([
        ...adminRecipients.map((recipient: string) =>
          sendAppEmail({
            templateName: "absence-admin",
            recipientEmail: recipient,
            idempotencyKey: `absence-admin-${submissionId}-${recipient}`,
            templateData: {
              fullName,
              reason,
              rtoTitle: (selectedRto.data as any)?.title || "RTO non specificato",
              rtoDate: (selectedRto.data as any)?.rto_date || "",
              memberEmail: user?.email || "",
            },
          })
        ),
        configuredSettings.email_confirm_absence !== false && user?.email
          ? sendAppEmail({
              templateName: "absence-confirmation",
              recipientEmail: user.email,
              idempotencyKey: `absence-confirm-${submissionId}`,
              templateData: {
                fullName,
                rtoTitle: (selectedRto.data as any)?.title || "RTO non specificato",
                rtoDate: (selectedRto.data as any)?.rto_date || "",
              },
            })
          : Promise.resolve(),
      ]);
    } catch (emailError) {
      console.error("Absence email error", emailError);
    }

    toast.success("Giustificazione inviata!");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-heading font-extrabold">Giustifica Assenza</h1>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-lg">
          <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-6 space-y-4">
            <div><Label>Nome e Cognome</Label><Input name="full_name" required defaultValue={user?.user_metadata?.full_name || ""} /></div>
            <div>
              <Label>Data RTO</Label>
              <select name="rto_date_id" className="w-full border rounded-md px-3 py-2 text-sm">
                <option value="">Seleziona...</option>
                {rtos?.map((r) => (
                  <option key={r.id} value={r.id}>{r.title} — {new Date(r.rto_date).toLocaleDateString("it-IT")}</option>
                ))}
              </select>
            </div>
            <div><Label>Motivo</Label><Textarea name="reason" rows={4} required placeholder="Descrivi il motivo dell'assenza..." /></div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Invio..." : "Invia Giustificazione"}</Button>
          </form>
        </div>
      </section>
    </Layout>
  );
}
