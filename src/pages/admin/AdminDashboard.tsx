import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Calendar, Users, MessageSquare, BookOpen, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { data: newsCount } = useQuery({
    queryKey: ["admin-news-count"],
    queryFn: async () => {
      const { count } = await supabase.from("news").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: eventsCount } = useQuery({
    queryKey: ["admin-events-count"],
    queryFn: async () => {
      const { count } = await supabase.from("events").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: regsCount } = useQuery({
    queryKey: ["admin-regs-count"],
    queryFn: async () => {
      const { count } = await supabase.from("course_registrations").select("*", { count: "exact", head: true }).eq("status", "new");
      return count ?? 0;
    },
  });
  const { data: msgsCount } = useQuery({
    queryKey: ["admin-msgs-count"],
    queryFn: async () => {
      const { count } = await supabase.from("contact_submissions").select("*", { count: "exact", head: true }).eq("status", "new");
      return count ?? 0;
    },
  });

  const stats = [
    { label: "News Pubblicate", value: newsCount, icon: Newspaper, path: "/admin/news", color: "text-blue-500" },
    { label: "Eventi", value: eventsCount, icon: Calendar, path: "/admin/events", color: "text-green-500" },
    { label: "Nuove Iscrizioni", value: regsCount, icon: BookOpen, path: "/admin/registrations", color: "text-orange-500" },
    { label: "Messaggi Nuovi", value: msgsCount, icon: MessageSquare, path: "/admin/submissions", color: "text-purple-500" },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Panoramica della gestione del sito</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link to={s.path} key={s.label}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-muted ${s.color}`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Azioni Rapide</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Crea News", path: "/admin/news" },
              { label: "Crea Evento", path: "/admin/events" },
              { label: "Gestisci Staff", path: "/admin/staff" },
              { label: "Gestisci RTO", path: "/admin/rto" },
              { label: "Impostazioni Sito", path: "/admin/settings" },
            ].map((a) => (
              <Link key={a.path} to={a.path} className="block px-4 py-2 rounded-lg bg-muted hover:bg-accent transition-colors text-sm">
                {a.label} →
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
