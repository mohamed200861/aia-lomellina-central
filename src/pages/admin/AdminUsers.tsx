import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Trash2 } from "lucide-react";

export default function AdminUsers() {
  const { isSuperAdmin, user } = useAuth();
  const qc = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: roles, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      // Get profiles for these users
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
  const roleLabels: Record<string, string> = { super_admin: "Super Admin", admin: "Admin", editor: "Editor", member: "Membro" };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">Utenti & Ruoli</h1>
        <p className="text-muted-foreground">Gestisci i ruoli degli utenti registrati</p>
        {!isSuperAdmin && <p className="text-sm text-orange-600 mt-2">Solo i Super Admin possono modificare i ruoli.</p>}
      </div>
      <div className="space-y-3">
        {users?.map((u) => (
          <Card key={u.id}>
            <CardContent className="p-4 flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 className="font-bold">{u.profile?.full_name || "Senza nome"}</h3>
                <p className="text-sm text-muted-foreground">{u.user_id}</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={u.role}
                  disabled={!isSuperAdmin || u.user_id === user?.id}
                  onChange={(e) => updateRole.mutate({ userId: u.user_id, role: e.target.value })}
                  className="border rounded px-3 py-1 text-sm"
                >
                  {roles.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
                </select>
                {isSuperAdmin && u.user_id !== user?.id && (
                  <Button size="sm" variant="destructive" onClick={() => { if (confirm("Rimuovere questo utente?")) deleteRole.mutate(u.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
