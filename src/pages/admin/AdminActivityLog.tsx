import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AdminActivityLog() {
  const [search, setSearch] = useState("");

  const { data: logs } = useQuery({
    queryKey: ["admin-activity-log"],
    queryFn: async () => {
      const { data, error } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data;
    },
  });

  const filtered = logs?.filter((l) =>
    `${l.action} ${l.entity_type} ${JSON.stringify(l.details)}`.toLowerCase().includes(search.toLowerCase())
  );

  const actionIcons: Record<string, string> = {
    create: "🟢",
    update: "🟡",
    delete: "🔴",
    login: "🔵",
    role_change: "🟣",
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Log Attività</h1>
        <p className="text-muted-foreground">Cronologia delle azioni nel pannello admin</p>
      </div>
      <Input placeholder="Cerca nel log..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm mb-4" />
      <div className="space-y-2">
        {filtered?.map((log) => (
          <Card key={log.id}>
            <CardContent className="p-3 flex items-start gap-3">
              <span className="text-lg">{actionIcons[log.action] || "⚪"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm capitalize">{log.action}</span>
                  {log.entity_type && <span className="text-xs bg-muted px-2 py-0.5 rounded">{log.entity_type}</span>}
                </div>
                {log.details && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">{JSON.stringify(log.details)}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{new Date(log.created_at).toLocaleString("it-IT")}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered?.length === 0 && <p className="text-center text-muted-foreground py-8">Nessuna attività registrata.</p>}
      </div>
    </AdminLayout>
  );
}
