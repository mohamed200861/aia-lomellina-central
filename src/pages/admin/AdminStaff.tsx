import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export default function AdminStaff() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const qc = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const { data: staff, isLoading, error } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: async () => {
      const { data, error } = await supabase.from("staff_members").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !authLoading,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (values.id) {
        const { error } = await supabase.from("staff_members").update(values).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("staff_members").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-staff"] }); setOpen(false); setEditing(null); toast.success("Salvato!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("staff_members").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-staff"] }); toast.success("Eliminato!"); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values: any = {
      full_name: fd.get("full_name") as string,
      role: fd.get("role") as string,
      category: fd.get("category") as string,
      sort_order: parseInt(fd.get("sort_order") as string) || 0,
    };
    if (editing) values.id = editing.id;
    saveMutation.mutate(values);
  };

  const categories = { board: "Consiglio Direttivo", collaborator: "Collaboratori", audit: "Organo di Revisione" };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Gestione Staff</h1>
          <p className="text-sm text-muted-foreground">{staff?.length ?? 0} membri</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Aggiungi</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Modifica" : "Nuovo Membro"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Nome Completo</Label><Input name="full_name" defaultValue={editing?.full_name} required /></div>
              <div><Label>Ruolo</Label><Input name="role" defaultValue={editing?.role} required /></div>
              <div><Label>Categoria</Label>
                <select name="category" defaultValue={editing?.category || "board"} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                  <option value="board">Consiglio Direttivo</option>
                  <option value="collaborator">Collaboratori</option>
                  <option value="audit">Organo di Revisione</option>
                </select>
              </div>
              <div><Label>Ordine</Label><Input name="sort_order" type="number" defaultValue={editing?.sort_order || 0} /></div>
              <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Salvataggio..." : "Salva"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      )}

      {error && <p className="text-destructive text-center py-8">Errore nel caricamento: {(error as Error).message}</p>}

      {!isLoading && !error && Object.entries(categories).map(([key, label]) => {
        const items = staff?.filter((s) => s.category === key);
        return (
          <div key={key} className="mb-6">
            <h2 className="font-heading font-bold text-lg mb-3">{label}</h2>
            <div className="space-y-2">
              {items && items.length > 0 ? items.map((s) => (
                <Card key={s.id}>
                  <CardContent className="p-3 flex justify-between items-center">
                    <div><span className="font-bold">{s.full_name}</span> — <span className="text-muted-foreground text-sm">{s.role}</span></div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditing(s); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => { if (confirm("Eliminare?")) deleteMutation.mutate(s.id); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <p className="text-sm text-muted-foreground py-2">Nessun membro in questa categoria.</p>
              )}
            </div>
          </div>
        );
      })}
    </AdminLayout>
  );
}
