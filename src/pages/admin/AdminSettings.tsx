import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminSettings() {
  const qc = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").limit(1).single();
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase.from("site_settings").update(values).eq("id", settings!.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["site-settings"] }); toast.success("Impostazioni salvate!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values: Record<string, string> = {};
    fd.forEach((v, k) => { values[k] = v as string; });
    updateMutation.mutate(values);
  };

  if (!settings) return <AdminLayout><p>Caricamento...</p></AdminLayout>;

  const fields = [
    { section: "Contatti", items: [
      { name: "address", label: "Indirizzo" },
      { name: "phone1", label: "Telefono 1" },
      { name: "phone2", label: "Telefono 2 / WhatsApp" },
      { name: "email", label: "Email" },
      { name: "whatsapp", label: "WhatsApp" },
    ]},
    { section: "Social", items: [
      { name: "facebook_url", label: "Facebook" },
      { name: "x_url", label: "X (Twitter)" },
      { name: "instagram_url", label: "Instagram" },
      { name: "youtube_url", label: "YouTube" },
      { name: "telegram_url", label: "Telegram" },
    ]},
    { section: "Homepage", items: [
      { name: "hero_title", label: "Titolo Hero" },
      { name: "hero_subtitle", label: "Sottotitolo Hero" },
      { name: "next_course_date", label: "Prossimo Corso" },
    ]},
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Impostazioni Globali</h1>
        <p className="text-muted-foreground">Modifica i dati di contatto e le informazioni mostrate ovunque nel sito</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {fields.map((group) => (
          <Card key={group.section}>
            <CardHeader><CardTitle>{group.section}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {group.items.map((f) => (
                <div key={f.name}>
                  <Label>{f.label}</Label>
                  <Input name={f.name} defaultValue={(settings as any)[f.name] || ""} />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        <Button type="submit" size="lg" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Salvataggio..." : "Salva Impostazioni"}
        </Button>
      </form>
    </AdminLayout>
  );
}
