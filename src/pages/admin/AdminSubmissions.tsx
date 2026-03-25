import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminSubmissions() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const qc = useQueryClient();

  const { data: submissions } = useQuery({
    queryKey: ["admin-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("contact_submissions").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-submissions"] }); toast.success("Aggiornato!"); },
  });

  const statuses: Record<string, string> = { new: "Nuovo", read: "Letto", replied: "Risposto", archived: "Archiviato" };
  const statusColors: Record<string, string> = { new: "bg-blue-100 text-blue-700", read: "bg-yellow-100 text-yellow-700", replied: "bg-green-100 text-green-700", archived: "bg-gray-100 text-gray-500" };

  const filtered = submissions?.filter((s) => {
    const matchSearch = `${s.name} ${s.email} ${s.subject}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Messaggi / Contatti</h1>
      </div>
      <div className="flex gap-3 mb-4 flex-wrap">
        <Input placeholder="Cerca..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
          <option value="all">Tutti</option>
          {Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="space-y-3">
        {filtered?.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div className="flex-1">
                  <h3 className="font-bold">{s.name}</h3>
                  <p className="text-sm text-muted-foreground">{s.email} {s.subject && `• ${s.subject}`}</p>
                  <p className="text-sm mt-2 bg-muted p-3 rounded">{s.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(s.created_at).toLocaleString("it-IT")}</p>
                </div>
                <select value={s.status || "new"} onChange={(e) => updateStatus.mutate({ id: s.id, status: e.target.value })} className="border rounded px-2 py-1 text-xs">
                  {Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
