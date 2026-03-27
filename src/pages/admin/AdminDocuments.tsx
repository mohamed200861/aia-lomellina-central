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
import FileUpload from "@/components/admin/FileUpload";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";

export default function AdminDocuments() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState("");
  const qc = useQueryClient();

  const { data: docs } = useQuery({
    queryKey: ["admin-documents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (values.id) {
        const { error } = await supabase.from("documents").update(values).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("documents").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-documents"] }); setOpen(false); setEditing(null); setFileUrl(""); toast.success("Salvato!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("documents").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-documents"] }); toast.success("Eliminato!"); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values: any = {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      category: fd.get("category") as string,
      file_url: fileUrl,
      is_published: fd.get("is_published") === "on",
      sort_order: parseInt(fd.get("sort_order") as string) || 0,
    };
    if (!values.file_url) { toast.error("Carica un file"); return; }
    if (editing) values.id = editing.id;
    saveMutation.mutate(values);
  };

  const categories = [...new Set(docs?.map((d) => d.category).filter(Boolean) || [])];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Documenti & Download</h1>
          <p className="text-muted-foreground">Gestisci i file scaricabili per gli associati</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setFileUrl(""); } }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Aggiungi Documento</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Modifica" : "Nuovo Documento"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Titolo</Label><Input name="title" defaultValue={editing?.title} required /></div>
              <div><Label>Descrizione</Label><Textarea name="description" defaultValue={editing?.description} /></div>
              <div><Label>Categoria</Label><Input name="category" defaultValue={editing?.category || "general"} placeholder="es. moduli, referti, atletica" /></div>
              <div>
                <Label>File</Label>
                <FileUpload bucket="documents" folder="files" onUpload={setFileUrl} currentUrl={editing?.file_url} label="Carica documento" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_published" defaultChecked={editing?.is_published ?? true} /> Pubblicato</label>
                <div><Label>Ordine</Label><Input name="sort_order" type="number" defaultValue={editing?.sort_order || 0} className="w-20" /></div>
              </div>
              <Button type="submit" disabled={saveMutation.isPending}>Salva</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {docs?.map((d) => (
          <Card key={d.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg"><FileText className="h-5 w-5 text-primary" /></div>
                <div>
                  <h3 className="font-bold text-sm">{d.title}</h3>
                  {d.description && <p className="text-xs text-muted-foreground">{d.description}</p>}
                  <span className="text-xs text-muted-foreground">{d.category}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditing(d); setFileUrl(d.file_url); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="destructive" onClick={() => { if (confirm("Eliminare?")) deleteMutation.mutate(d.id); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {docs?.length === 0 && <p className="text-center text-muted-foreground py-8">Nessun documento. Carica il primo!</p>}
      </div>
    </AdminLayout>
  );
}
