import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminMedical() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const qc = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const { data: centers, isLoading, error } = useQuery({
    queryKey: ["admin-medical"],
    queryFn: async () => {
      const { data, error } = await supabase.from("medical_centers").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !authLoading && !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (values.id) {
        const { error } = await supabase.from("medical_centers").update(values).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("medical_centers").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-medical"] }); setOpen(false); setEditing(null); toast.success("Salvato!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("medical_centers").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-medical"] }); toast.success("Eliminato!"); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values: any = {
      name: fd.get("name") as string,
      address: fd.get("address") as string,
      phone: fd.get("phone") as string,
      instructions: fd.get("instructions") as string,
      sort_order: parseInt(fd.get("sort_order") as string) || 0,
    };
    if (editing) values.id = editing.id;
    saveMutation.mutate(values);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Centri Medici</h1>
          <p className="text-sm text-muted-foreground">{centers?.length ?? 0} centri configurati</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Aggiungi Centro</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Modifica" : "Nuovo Centro"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Nome</Label><Input name="name" defaultValue={editing?.name} required /></div>
              <div><Label>Indirizzo</Label><Input name="address" defaultValue={editing?.address} /></div>
              <div><Label>Telefono</Label><Input name="phone" defaultValue={editing?.phone} /></div>
              <div><Label>Note / Istruzioni</Label><Textarea name="instructions" defaultValue={editing?.instructions} /></div>
              <div><Label>Ordine</Label><Input name="sort_order" type="number" defaultValue={editing?.sort_order || 0} /></div>
              <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Salvataggio..." : "Salva"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      )}

      {error && <p className="text-destructive text-center py-8">Errore nel caricamento: {(error as Error).message}</p>}

      {!isLoading && !error && (
        <div className="space-y-3">
          {centers?.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4 flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{c.name}</h3>
                  {c.address && <p className="text-sm text-muted-foreground">{c.address}</p>}
                  {c.phone && <p className="text-sm text-muted-foreground">📞 {c.phone}</p>}
                  {c.instructions && <p className="text-sm mt-1">{c.instructions}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => { if (confirm("Eliminare?")) deleteMutation.mutate(c.id); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {centers?.length === 0 && <p className="text-center text-muted-foreground py-8">Nessun centro medico.</p>}
        </div>
      )}
    </AdminLayout>
  );
}
