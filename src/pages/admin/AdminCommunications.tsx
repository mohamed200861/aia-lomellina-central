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

export default function AdminCommunications() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const qc = useQueryClient();

  const { data: comms } = useQuery({
    queryKey: ["admin-communications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("internal_communications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (values.id) {
        const { error } = await supabase.from("internal_communications").update(values).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("internal_communications").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-communications"] }); setOpen(false); setEditing(null); toast.success("Salvato!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("internal_communications").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-communications"] }); toast.success("Eliminato!"); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values: any = {
      title: fd.get("title") as string,
      content: fd.get("content") as string,
      is_published: fd.get("is_published") === "on",
    };
    if (editing) values.id = editing.id;
    saveMutation.mutate(values);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Comunicazioni Interne</h1>
          <p className="text-muted-foreground">Gestisci avvisi e comunicazioni per gli associati</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Nuova Comunicazione</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Modifica" : "Nuova Comunicazione"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Titolo</Label><Input name="title" defaultValue={editing?.title} required /></div>
              <div><Label>Contenuto</Label><Textarea name="content" rows={6} defaultValue={editing?.content} /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_published" defaultChecked={editing?.is_published ?? true} /> Pubblicata</label>
              <Button type="submit" disabled={saveMutation.isPending}>Salva</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {comms?.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{c.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {c.is_published ? "Pubblica" : "Bozza"}
                  </span>
                </div>
                {c.content && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.content}</p>}
                <p className="text-xs text-muted-foreground mt-1">{new Date(c.created_at).toLocaleString("it-IT")}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="destructive" onClick={() => { if (confirm("Eliminare?")) deleteMutation.mutate(c.id); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {comms?.length === 0 && <p className="text-center text-muted-foreground py-8">Nessuna comunicazione.</p>}
      </div>
    </AdminLayout>
  );
}
