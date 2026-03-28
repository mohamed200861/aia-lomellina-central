import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Search, UserCheck, UserX } from "lucide-react";

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
  const [statusFilter, setStatusFilter] = useState("all");
  const qc = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "list" },
      });
      if (error) throw error;
      return (data?.users ?? []) as Array<{
        user_id: string;
        email: string;
        full_name: string | null;
        created_at: string;
        email_confirmed_at: string | null;
        role: string;
        is_active: boolean;
      }>;
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.functions.invoke("admin-users", {
        body: { action: "setRole", userId, role },
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Ruolo aggiornato!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateActiveState = useMutation({
    mutationFn: async ({ userId, active }: { userId: string; active: boolean }) => {
      const { error } = await supabase.functions.invoke("admin-users", {
        body: { action: "setActive", userId, active },
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Stato utente aggiornato!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const roles = ["super_admin", "admin", "editor", "member"];

  const filtered = users?.filter((u) => {
    const matchSearch = `${u.full_name || ""} ${u.email} ${u.user_id}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? u.is_active : !u.is_active);
    return matchSearch && matchRole && matchStatus;
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
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-background">
          <option value="all">Tutti gli stati</option>
          <option value="active">Attivi</option>
          <option value="inactive">Disattivati</option>
        </select>
      </div>

      {isLoading && <p className="text-muted-foreground">Caricamento...</p>}

      <div className="space-y-3">
        {filtered?.map((u) => (
          <Card key={u.user_id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {(u.full_name || u.email || "?")[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">{u.full_name || "Senza nome"}</h3>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Registrato: {new Date(u.created_at).toLocaleDateString("it-IT")}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[11px] px-2 py-1 rounded-full ${u.email_confirmed_at ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                      {u.email_confirmed_at ? "Email verificata" : "Email non verificata"}
                    </span>
                    <span className={`text-[11px] px-2 py-1 rounded-full ${u.is_active ? "bg-secondary text-secondary-foreground" : "bg-destructive/10 text-destructive"}`}>
                      {u.is_active ? "Attivo" : "Disattivato"}
                    </span>
                  </div>
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
                    <Button
                      size="sm"
                      variant={u.is_active ? "destructive" : "secondary"}
                      onClick={() => {
                        if (confirm(u.is_active ? "Disattivare questo utente?" : "Riattivare questo utente?")) {
                          updateActiveState.mutate({ userId: u.user_id, active: !u.is_active });
                        }
                      }}
                    >
                      {u.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
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
