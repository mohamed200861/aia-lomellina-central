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
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminPressReview() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: articles } = useQuery({
    queryKey: ["admin-press-review"],
    queryFn: async () => {
      const { data, error } = await supabase.from("press_review").select("*").order("article_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (editing?.id) {
        const { error } = await supabase.from("press_review").update(values).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("press_review").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-press-review"] }); toast.success("Salvato!"); setOpen(false); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("press_review").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-press-review"] }); toast.success("Eliminato!"); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const articleDate = fd.get("article_date") as string;
    saveMutation.mutate({
      article_date: articleDate,
      year: new Date(articleDate).getFullYear(),
      newspaper: fd.get("newspaper") as string,
      page: (fd.get("page") as string) || null,
      external_url: (fd.get("external_url") as string) || null,
    });
  };

  const years = [...new Set(articles?.map((a) => a.year) || [])].sort((a, b) => b - a);

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Rassegna Stampa</h1>
          <p className="text-muted-foreground">Gestisci gli articoli della rassegna stampa</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Aggiungi Articolo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Modifica Articolo" : "Nuovo Articolo"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Data Articolo</Label><Input name="article_date" type="date" required defaultValue={editing?.article_date || ""} /></div>
              <div><Label>Testata</Label><Input name="newspaper" required defaultValue={editing?.newspaper || ""} /></div>
              <div><Label>Pagina</Label><Input name="page" defaultValue={editing?.page || ""} placeholder="es. Pag. 40" /></div>
              <div><Label>Link esterno</Label><Input name="external_url" type="url" defaultValue={editing?.external_url || ""} /></div>
              <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Salvataggio..." : "Salva"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {years.map((year) => (
        <div key={year} className="mb-8">
          <h2 className="font-heading font-bold text-lg mb-3">{year}</h2>
          <div className="space-y-2">
            {articles?.filter((a) => a.year === year).map((a) => (
              <Card key={a.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{new Date(a.article_date).toLocaleDateString("it-IT")}</span>
                    <span className="mx-2">—</span>
                    <span className="font-bold text-sm">{a.newspaper}</span>
                    {a.page && <span className="text-sm text-muted-foreground ml-2">• {a.page}</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(a); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { if (confirm("Eliminare?")) deleteMutation.mutate(a.id); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </AdminLayout>
  );
}
