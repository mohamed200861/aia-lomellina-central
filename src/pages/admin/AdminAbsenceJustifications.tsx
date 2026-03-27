import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminAbsenceJustifications() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const qc = useQueryClient();

  const { data: justifications } = useQuery({
    queryKey: ["admin-justifications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("absence_justifications").select("*, rto_dates(title, rto_date)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("absence_justifications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-justifications"] }); toast.success("Aggiornato!"); },
  });

  const statuses: Record<string, string> = { pending: "In attesa", reviewed: "Verificata", archived: "Archiviata" };
  const statusColors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", reviewed: "bg-green-100 text-green-700", archived: "bg-muted text-muted-foreground" };

  const filtered = justifications?.filter((j) => {
    const matchSearch = j.full_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Giustificazioni Assenza</h1>
        <p className="text-muted-foreground">Gestisci le giustificazioni ricevute</p>
      </div>
      <div className="flex gap-3 mb-4 flex-wrap">
        <Input placeholder="Cerca per nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-background">
          <option value="all">Tutti</option>
          {Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="space-y-3">
        {filtered?.map((j) => (
          <Card key={j.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div className="flex-1">
                  <h3 className="font-bold">{j.full_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    RTO: {(j as any).rto_dates?.title || "N/D"} — {(j as any).rto_dates?.rto_date ? new Date((j as any).rto_dates.rto_date).toLocaleDateString("it-IT") : ""}
                  </p>
                  <p className="text-sm mt-1 bg-muted p-2 rounded">{j.reason}</p>
                  {j.attachment_url && (
                    <a href={j.attachment_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">📎 Allegato</a>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(j.created_at).toLocaleString("it-IT")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[j.status || "pending"]}`}>
                    {statuses[(j.status || "pending") as keyof typeof statuses]}
                  </span>
                  <select value={j.status || "pending"} onChange={(e) => updateStatus.mutate({ id: j.id, status: e.target.value })} className="border rounded px-2 py-1 text-xs bg-background">
                    {Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered?.length === 0 && <p className="text-center text-muted-foreground py-8">Nessuna giustificazione.</p>}
      </div>
    </AdminLayout>
  );
}
