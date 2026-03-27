import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Trash2, Search, UserCheck, UserX } from "lucide-react";

const roleLabels: Record<string, string> = {
  super_admin: "Il Grande P",
  admin: "Admin",
  editor: "Editor",
  member: "Membro",
};

const roleBadgeColors: Record<string, string> = {
  super_admin: "bg-secondary text-secondary-foreground",
  admin: "bg-primary text-primary-foreground",
  editor: "bg-accent text-accent-foreground",
  member: "bg-muted text-muted-foreground",
};

export default function AdminUsers() {
  const { isSuperAdmin, user } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const qc = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: roles, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      const userIds = [...new Set(roles.map((r) => r.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds);
      return roles.map((r) => ({
        ...r,
        profile: profiles?.find((p) => p.user_id === r.user_id),
      }));
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.from("user_roles").update({ role: role as any }).eq("user_id", userId);
      if (error) throw error;
      // Log activity
      await supabase.from("activity_log").insert({
        action: "role_change",
        entity_type: "user",
        entity_id: userId,
        user_id: user?.id,
        details: { new_role: role },
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Ruolo aggiornato!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Utente rimosso!"); },
  });

  const roles = ["super_admin", "admin", "editor", "member"];

  const filtered = users?.filter((u) => {
    const matchSearch = `${u.profile?.full_name || ""} ${u.user_id}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Utenti & Ruoli</h1>
        <p className="text-muted-foreground">
          {users?.length || 0} utenti registrati
          {!isSuperAdmin && " — Solo Il Grande P può modificare i ruoli"}
        </p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cerca utente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-background">
          <option value="all">Tutti i ruoli</option>
          {roles.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
        </select>
      </div>

      {isLoading && <p className="text-muted-foreground">Caricamento...</p>}

      <div className="space-y-3">
        {filtered?.map((u) => (
          <Card key={u.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {(u.profile?.full_name || "?")[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">{u.profile?.full_name || "Senza nome"}</h3>
                  <p className="text-xs text-muted-foreground">{u.user_id.slice(0, 8)}…</p>
                  <p className="text-xs text-muted-foreground">
                    Registrato: {new Date(u.created_at).toLocaleDateString("it-IT")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${roleBadgeColors[u.role] || "bg-muted"}`}>
                  {roleLabels[u.role] || u.role}
                </span>
                {isSuperAdmin && u.user_id !== user?.id && (
                  <>
                    <select
                      value={u.role}
                      onChange={(e) => {
                        if (confirm(`Cambiare il ruolo a "${roleLabels[e.target.value]}"?`)) {
                          updateRole.mutate({ userId: u.user_id, role: e.target.value });
                        }
                      }}
                      className="border rounded px-2 py-1 text-xs bg-background"
                    >
                      {roles.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
                    </select>
                    <Button size="sm" variant="destructive" onClick={() => { if (confirm("Rimuovere questo utente dal sistema?")) deleteRole.mutate(u.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered?.length === 0 && <p className="text-center text-muted-foreground py-8">Nessun utente trovato.</p>}
      </div>
    </AdminLayout>
  );
}
