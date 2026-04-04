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

export default function AdminRTO() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const qc = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const { data: rtos, isLoading, error } = useQuery({
    queryKey: ["admin-rto"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rto_dates").select("*").order("rto_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !authLoading && !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (values.id) {
        const { error } = await supabase.from("rto_dates").update(values).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rto_dates").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-rto"] }); setOpen(false); setEditing(null); toast.success("Salvato!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("rto_dates").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-rto"] }); toast.success("Eliminato!"); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values: any = {
      title: fd.get("title") as string,
      rto_date: fd.get("rto_date") as string,
      rto_time: fd.get("rto_time") as string,
      location: fd.get("location") as string,
      notes: fd.get("notes") as string,
      is_published: fd.get("is_published") === "on",
    };
    if (editing) values.id = editing.id;
    saveMutation.mutate(values);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Gestione RTO</h1>
          <p className="text-sm text-muted-foreground">{rtos?.length ?? 0} date configurate</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Nuova RTO</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Modifica" : "Nuova RTO"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Titolo</Label><Input name="title" defaultValue={editing?.title} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Data</Label><Input name="rto_date" type="date" defaultValue={editing?.rto_date} required /></div>
                <div><Label>Ora</Label><Input name="rto_time" defaultValue={editing?.rto_time} placeholder="20:30" /></div>
              </div>
              <div><Label>Luogo</Label><Input name="location" defaultValue={editing?.location} /></div>
              <div><Label>Note</Label><Textarea name="notes" defaultValue={editing?.notes} /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_published" defaultChecked={editing?.is_published ?? true} /> Pubblicata</label>
              <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Salvataggio..." : "Salva"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      )}

      {error && <p className="text-destructive text-center py-8">Errore nel caricamento: {(error as Error).message}</p>}

      {!isLoading && !error && (
        <div className="space-y-3">
          {rtos?.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{r.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(r.rto_date).toLocaleDateString("it-IT")} {r.rto_time && `• ${r.rto_time}`} {r.location && `• ${r.location}`}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {r.is_published ? "Pubblicata" : "Bozza"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => { if (confirm("Eliminare?")) deleteMutation.mutate(r.id); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {rtos?.length === 0 && <p className="text-center text-muted-foreground py-8">Nessuna RTO configurata.</p>}
        </div>
      )}
    </AdminLayout>
  );
}
