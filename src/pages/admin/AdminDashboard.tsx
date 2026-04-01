import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, Calendar, MessageSquare, BookOpen, Archive, Shield, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { data: newsCount } = useQuery({
    queryKey: ["admin-news-count"],
    queryFn: async () => { const { count } = await supabase.from("news").select("*", { count: "exact", head: true }); return count ?? 0; },
  });
  const { data: eventsCount } = useQuery({
    queryKey: ["admin-events-count"],
    queryFn: async () => { const { count } = await supabase.from("events").select("*", { count: "exact", head: true }); return count ?? 0; },
  });
  const { data: regsCount } = useQuery({
    queryKey: ["admin-regs-count"],
    queryFn: async () => { const { count } = await supabase.from("course_registrations").select("*", { count: "exact", head: true }).eq("status", "new"); return count ?? 0; },
  });
  const { data: msgsCount } = useQuery({
    queryKey: ["admin-msgs-count"],
    queryFn: async () => { const { count } = await supabase.from("contact_submissions").select("*", { count: "exact", head: true }).eq("status", "new"); return count ?? 0; },
  });
  const { data: refereesCount } = useQuery({
    queryKey: ["admin-referees-count"],
    queryFn: async () => { const { count } = await supabase.from("referees").select("*", { count: "exact", head: true }); return count ?? 0; },
  });
  const { data: justCount } = useQuery({
    queryKey: ["admin-just-count"],
    queryFn: async () => { const { count } = await supabase.from("absence_justifications").select("*", { count: "exact", head: true }).eq("status", "pending"); return count ?? 0; },
  });
  const { data: usersCount } = useQuery({
    queryKey: ["admin-users-count"],
    queryFn: async () => { const { count } = await supabase.from("user_roles").select("*", { count: "exact", head: true }); return count ?? 0; },
  });

  const stats = [
    { label: "News", value: newsCount, icon: Newspaper, path: "/admin/news" },
    { label: "Eventi", value: eventsCount, icon: Calendar, path: "/admin/events" },
    { label: "Nuove Iscrizioni", value: regsCount, icon: BookOpen, path: "/admin/registrations" },
    { label: "Messaggi Nuovi", value: msgsCount, icon: MessageSquare, path: "/admin/submissions" },
    { label: "Giustificazioni", value: justCount, icon: Archive, path: "/admin/justifications" },
    { label: "Utenti", value: usersCount, icon: Shield, path: "/admin/users" },
  ];

  const quickActions = [
    { label: "Crea News", path: "/admin/news" },
    { label: "Crea Evento", path: "/admin/events" },
    { label: "Carica Media", path: "/admin/media" },
    { label: "Gestisci Staff", path: "/admin/staff" },
    { label: "Gestisci RTO", path: "/admin/rto" },
    { label: "Gestisci Rimborsi", path: "/admin/reimbursements" },
    { label: "Referti", path: "/admin/reports" },
    { label: "Documenti", path: "/admin/documents" },
    { label: "Comunicazioni", path: "/admin/communications" },
    { label: "Email Settings", path: "/admin/email-settings" },
    { label: "Impostazioni Sito", path: "/admin/settings" },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Panoramica della gestione del sito AIA Lomellina</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link to={s.path} key={s.label}>
            <Card className="hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: 'hsl(var(--primary))' }}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent text-accent-foreground">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-heading">{s.value ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Azioni Rapide</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {quickActions.map((a) => (
              <Link key={a.path} to={a.path} className="block px-4 py-3 rounded-lg bg-muted hover:bg-accent transition-colors text-sm font-medium text-center">
                {a.label}
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Sezioni del Sito</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {[
              { label: "Homepage & Impostazioni", path: "/admin/settings" },
              { label: "Rassegna Stampa", path: "/admin/press-review" },
              { label: "Area Atletica", path: "/admin/athletic" },
              { label: "Centri Medici", path: "/admin/medical" },
              { label: "Email & Notifiche", path: "/admin/email-settings" },
              { label: "Log Attività", path: "/admin/activity-log" },
            ].map((a) => (
              <Link key={a.path} to={a.path} className="block px-4 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm">
                {a.label} →
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
