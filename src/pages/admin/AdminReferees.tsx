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
import { Plus, Pencil, Trash2, Search } from "lucide-react";

export default function AdminReferees() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const { user, loading: authLoading } = useAuth();

  const { data: referees, isLoading, error } = useQuery({
    queryKey: ["admin-referees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("referees").select("*").order("last_name");
      if (error) throw error;
      return data;
    },
    enabled: !authLoading && !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (editing?.id) {
        const { error } = await supabase.from("referees").update(values).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("referees").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-referees"] }); toast.success("Salvato!"); setOpen(false); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("referees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-referees"] }); toast.success("Eliminato!"); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveMutation.mutate({
      last_name: fd.get("last_name") as string,
      first_name: fd.get("first_name") as string,
      qualification: fd.get("qualification") as string,
      technical_body: fd.get("technical_body") as string,
    });
  };

  const filtered = referees?.filter((r) => `${r.last_name} ${r.first_name}`.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Organico Arbitri</h1>
          <p className="text-muted-foreground">{referees?.length || 0} arbitri registrati</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Aggiungi</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Modifica Arbitro" : "Nuovo Arbitro"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Cognome</Label><Input name="last_name" required defaultValue={editing?.last_name || ""} /></div>
              <div><Label>Nome</Label><Input name="first_name" required defaultValue={editing?.first_name || ""} /></div>
              <div><Label>Qualifica (AE, OA, AB)</Label><Input name="qualification" required defaultValue={editing?.qualification || "AE"} /></div>
              <div><Label>Organo Tecnico (OTS, OTR, CON/PRO)</Label><Input name="technical_body" required defaultValue={editing?.technical_body || "OTS"} /></div>
              <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Salvataggio..." : "Salva"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cerca..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      )}

      {error && <p className="text-destructive text-center py-8">Errore nel caricamento: {(error as Error).message}</p>}

      {!isLoading && !error && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted"><th className="p-3 text-left">Cognome</th><th className="p-3 text-left">Nome</th><th className="p-3">Qualifica</th><th className="p-3">OT</th><th className="p-3 w-20"></th></tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t hover:bg-muted/50">
                  <td className="p-3 font-medium">{r.last_name}</td>
                  <td className="p-3">{r.first_name}</td>
                  <td className="p-3 text-center">{r.qualification}</td>
                  <td className="p-3 text-center">{r.technical_body}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { if (confirm("Eliminare?")) deleteMutation.mutate(r.id); }}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Nessun arbitro trovato.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
