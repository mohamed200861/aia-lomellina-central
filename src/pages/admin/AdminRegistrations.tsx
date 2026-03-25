import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminRegistrations() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const qc = useQueryClient();

  const { data: registrations } = useQuery({
    queryKey: ["admin-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("course_registrations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("course_registrations").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-registrations"] }); toast.success("Stato aggiornato!"); },
  });

  const statuses = { new: "Nuova", contacted: "Contattato", approved: "Approvata", archived: "Archiviata" };
  const statusColors: Record<string, string> = { new: "bg-blue-100 text-blue-700", contacted: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", archived: "bg-gray-100 text-gray-500" };

  const filtered = registrations?.filter((r) => {
    const matchSearch = `${r.first_name} ${r.last_name} ${r.email}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Iscrizioni Corso Arbitri</h1>
        <p className="text-muted-foreground">Gestisci le richieste di iscrizione al corso</p>
      </div>
      <div className="flex gap-3 mb-4 flex-wrap">
        <Input placeholder="Cerca..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
          <option value="all">Tutti</option>
          {Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="space-y-3">
        {filtered?.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <h3 className="font-bold">{r.first_name} {r.last_name}</h3>
                  <p className="text-sm text-muted-foreground">{r.email} • {r.phone}</p>
                  {r.notes && <p className="text-sm mt-1">{r.notes}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString("it-IT")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[r.status || "new"]}`}>{statuses[(r.status || "new") as keyof typeof statuses]}</span>
                  <select
                    value={r.status || "new"}
                    onChange={(e) => updateStatus.mutate({ id: r.id, status: e.target.value })}
                    className="border rounded px-2 py-1 text-xs"
                  >
                    {Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered?.length === 0 && <p className="text-center text-muted-foreground py-8">Nessuna iscrizione.</p>}
      </div>
    </AdminLayout>
  );
}
