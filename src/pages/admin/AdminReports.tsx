import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminReports() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const qc = useQueryClient();

  const { data: reports } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("report_settings").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (values.id) {
        const { error } = await supabase.from("report_settings").update(values).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("report_settings").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reports"] }); setOpen(false); setEditing(null); toast.success("Salvato!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("report_settings").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reports"] }); toast.success("Eliminato!"); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values: any = {
      category: fd.get("category") as string,
      instructions: fd.get("instructions") as string,
      destination_email: fd.get("destination_email") as string,
      deadline: fd.get("deadline") as string,
      sort_order: parseInt(fd.get("sort_order") as string) || 0,
    };
    if (editing) values.id = editing.id;
    saveMutation.mutate(values);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-heading font-bold">Gestione Referti</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Aggiungi</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Modifica" : "Nuova Categoria"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Categoria</Label><Input name="category" defaultValue={editing?.category} required /></div>
              <div><Label>Istruzioni</Label><Textarea name="instructions" defaultValue={editing?.instructions} rows={4} /></div>
              <div><Label>Email Destinazione</Label><Input name="destination_email" type="email" defaultValue={editing?.destination_email} /></div>
              <div><Label>Scadenza</Label><Input name="deadline" defaultValue={editing?.deadline} /></div>
              <div><Label>Ordine</Label><Input name="sort_order" type="number" defaultValue={editing?.sort_order || 0} /></div>
              <Button type="submit">Salva</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {reports?.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4 flex justify-between items-start">
              <div>
                <h3 className="font-bold">{r.category}</h3>
                {r.destination_email && <p className="text-sm text-muted-foreground">Email: {r.destination_email}</p>}
                {r.deadline && <p className="text-sm text-muted-foreground">Scadenza: {r.deadline}</p>}
                {r.instructions && <p className="text-sm mt-2 line-clamp-2">{r.instructions}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="destructive" onClick={() => { if (confirm("Eliminare?")) deleteMutation.mutate(r.id); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
