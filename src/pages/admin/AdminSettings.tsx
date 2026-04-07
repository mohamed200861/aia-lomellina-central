import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { BarChart3, Globe, Share2, Layout, ArrowRight, Loader2 } from "lucide-react";

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Impostazioni salvate!");
    },
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

  const sections = [
    {
      title: "Contatti Principali",
      description: "Questi dati appaiono nel footer, nella pagina contatti e in tutti i link del sito",
      icon: Globe,
      items: [
        { name: "site_name", label: "Nome Sito" },
        { name: "address", label: "Indirizzo Sede" },
        { name: "phone1", label: "Telefono Principale" },
        { name: "phone2", label: "Telefono 2 / WhatsApp" },
        { name: "email", label: "Email Principale" },
        { name: "whatsapp", label: "Numero WhatsApp (per link wa.me)" },
      ],
    },
    {
      title: "Social Media",
      description: "Aggiornando questi link cambieranno automaticamente in header, footer e homepage",
      icon: Share2,
      items: [
        { name: "facebook_url", label: "Facebook URL" },
        { name: "x_url", label: "X (Twitter) URL" },
        { name: "instagram_url", label: "Instagram URL" },
        { name: "youtube_url", label: "YouTube URL" },
        { name: "telegram_url", label: "Telegram URL" },
      ],
    },
    {
      title: "Homepage & Branding",
      description: "Titolo hero, sottotitolo e informazioni corso",
      icon: Layout,
      items: [
        { name: "hero_title", label: "Titolo Hero" },
        { name: "hero_subtitle", label: "Sottotitolo Hero" },
        { name: "next_course_date", label: "Data Prossimo Corso" },
        { name: "footer_text", label: "Testo Footer" },
      ],
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Impostazioni Globali</h1>
        <p className="text-muted-foreground">
          Modifica i dati di contatto e le informazioni del sito — ogni modifica si sincronizza ovunque automaticamente
        </p>
      </div>

      {/* Quick link to counters */}
      <Link
        to="/admin/counters"
        className="mb-6 flex items-center gap-3 p-4 bg-accent rounded-xl border hover:shadow-md transition-shadow group"
      >
        <div className="bg-primary text-primary-foreground p-3 rounded-lg">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-bold text-sm">Contatori Homepage</h3>
          <p className="text-xs text-muted-foreground">Gestisci le statistiche numeriche visualizzate nella homepage</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {sections.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <group.icon className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">{group.title}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.items.map((f) => (
                <div key={f.name}>
                  <Label className="text-sm font-medium">{f.label}</Label>
                  <Input name={f.name} defaultValue={(settings as any)[f.name] || ""} className="mt-1" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        <Button type="submit" size="lg" disabled={updateMutation.isPending} className="w-full sm:w-auto">
          {updateMutation.isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Salvataggio...</>
          ) : (
            "Salva Impostazioni"
          )}
        </Button>
      </form>
    </AdminLayout>
  );
}
