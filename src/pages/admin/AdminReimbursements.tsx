import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminReimbursements() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const qc = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const { data: rules, isLoading, error } = useQuery({
    queryKey: ["admin-reimbursements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reimbursement_rules").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !authLoading,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (values.id) {
        const { error } = await supabase.from("reimbursement_rules").update(values).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("reimbursement_rules").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reimbursements"] }); setOpen(false); setEditing(null); toast.success("Salvato!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("reimbursement_rules").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reimbursements"] }); toast.success("Eliminato!"); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values: any = {
      category: fd.get("category") as string,
      role: fd.get("role") as string,
      distance_bracket: fd.get("distance_bracket") as string,
      amount: parseFloat(fd.get("amount") as string),
      sort_order: parseInt(fd.get("sort_order") as string) || 0,
    };
    if (editing) values.id = editing.id;
    saveMutation.mutate(values);
  };

  const categories = [...new Set(rules?.map((r) => r.category) || [])];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Gestione Rimborsi</h1>
          <p className="text-sm text-muted-foreground">{rules?.length ?? 0} regole configurate</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Aggiungi Regola</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Modifica" : "Nuova Regola"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Categoria (es. Calcio 11)</Label><Input name="category" defaultValue={editing?.category} required /></div>
              <div><Label>Ruolo (es. Arbitro)</Label><Input name="role" defaultValue={editing?.role} required /></div>
              <div><Label>Fascia Distanza (es. 0-30 km)</Label><Input name="distance_bracket" defaultValue={editing?.distance_bracket} required /></div>
              <div><Label>Importo (€)</Label><Input name="amount" type="number" step="0.01" defaultValue={editing?.amount} required /></div>
              <div><Label>Ordine</Label><Input name="sort_order" type="number" defaultValue={editing?.sort_order || 0} /></div>
              <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Salvataggio..." : "Salva"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      )}

      {error && <p className="text-destructive text-center py-8">Errore nel caricamento: {(error as Error).message}</p>}

      {!isLoading && !error && categories.length > 0 ? categories.map((cat) => (
        <div key={cat} className="mb-6">
          <h2 className="font-heading font-bold text-lg mb-3">{cat}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead><tr className="bg-muted"><th className="p-2 text-left">Ruolo</th><th className="p-2 text-left">Distanza</th><th className="p-2 text-right">Importo</th><th className="p-2"></th></tr></thead>
              <tbody>
                {rules?.filter((r) => r.category === cat).map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-2">{r.role}</td>
                    <td className="p-2">{r.distance_bracket}</td>
                    <td className="p-2 text-right">€{Number(r.amount).toFixed(2)}</td>
                    <td className="p-2 text-right">
                      <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => { if (confirm("Eliminare?")) deleteMutation.mutate(r.id); }}><Trash2 className="h-3 w-3" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )) : (!isLoading && !error && <p className="text-muted-foreground text-center py-8">Nessuna regola rimborsi. Aggiungi la prima!</p>)}
    </AdminLayout>
  );
}
