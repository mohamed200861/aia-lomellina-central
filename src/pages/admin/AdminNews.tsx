import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminNews() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const qc = useQueryClient();

  const { data: news, isLoading } = useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => {
      const { data, error } = await supabase.from("news").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (values.id) {
        const { error } = await supabase.from("news").update(values).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("news").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-news"] });
      setOpen(false);
      setEditing(null);
      toast.success("News salvata!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-news"] });
      toast.success("News eliminata!");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values: any = {
      title: fd.get("title") as string,
      content: fd.get("content") as string,
      excerpt: fd.get("excerpt") as string,
      category: fd.get("category") as string,
      is_published: fd.get("is_published") === "on",
      is_featured: fd.get("is_featured") === "on",
    };
    if (values.is_published) values.published_at = new Date().toISOString();
    if (editing) values.id = editing.id;
    saveMutation.mutate(values);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Gestione News</h1>
          <p className="text-muted-foreground">Crea, modifica e pubblica news</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nuova News</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Modifica News" : "Nuova News"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Titolo</Label>
                <Input id="title" name="title" defaultValue={editing?.title} required />
              </div>
              <div>
                <Label htmlFor="excerpt">Anteprima</Label>
                <Input id="excerpt" name="excerpt" defaultValue={editing?.excerpt} />
              </div>
              <div>
                <Label htmlFor="content">Contenuto</Label>
                <Textarea id="content" name="content" rows={8} defaultValue={editing?.content} />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input id="category" name="category" defaultValue={editing?.category || "Generale"} />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="is_published" defaultChecked={editing?.is_published ?? true} />
                  Pubblicata
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="is_featured" defaultChecked={editing?.is_featured} />
                  In evidenza
                </label>
              </div>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Salvataggio..." : "Salva"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {isLoading && <p>Caricamento...</p>}
        {news?.map((n) => (
          <Card key={n.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold">{n.title}</h3>
                <div className="flex gap-2 mt-1 text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${n.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {n.is_published ? "Pubblicata" : "Bozza"}
                  </span>
                  <span className="text-muted-foreground">{n.category}</span>
                  <span className="text-muted-foreground">{new Date(n.created_at).toLocaleDateString("it-IT")}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditing(n); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { if (confirm("Eliminare questa news?")) deleteMutation.mutate(n.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {news?.length === 0 && <p className="text-muted-foreground text-center py-8">Nessuna news. Crea la prima!</p>}
      </div>
    </AdminLayout>
  );
}
