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
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminAthletic() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState("");
  const qc = useQueryClient();

  const { data: content } = useQuery({
    queryKey: ["admin-athletic"],
    queryFn: async () => {
      const { data, error } = await supabase.from("athletic_content").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (values.id) {
        const { error } = await supabase.from("athletic_content").update(values).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("athletic_content").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-athletic"] }); setOpen(false); setEditing(null); setFileUrl(""); toast.success("Salvato!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("athletic_content").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-athletic"] }); toast.success("Eliminato!"); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values: any = {
      title: fd.get("title") as string,
      content: fd.get("content") as string,
      category: fd.get("category") as string,
      file_url: fileUrl || null,
      is_published: fd.get("is_published") === "on",
      sort_order: parseInt(fd.get("sort_order") as string) || 0,
    };
    if (editing) values.id = editing.id;
    saveMutation.mutate(values);
  };

  const categories: Record<string, string> = { polo: "Polo Atletico", "yo-yo": "Test Yo-Yo", yoyo: "Test Yo-Yo", sds: "Test SDS", training: "Allenamento", general: "Generale" };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Area Atletica</h1>
          <p className="text-muted-foreground">Gestisci contenuti, file audio e PDF dell'area atletica</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setFileUrl(""); } }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Aggiungi</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Modifica" : "Nuovo Contenuto"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Titolo</Label><Input name="title" defaultValue={editing?.title} required /></div>
              <div><Label>Categoria</Label>
                <select name="category" defaultValue={editing?.category || "general"} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                  {Object.entries(categories).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><Label>Contenuto</Label><Textarea name="content" rows={6} defaultValue={editing?.content} /></div>
              <div>
                <Label>File (Audio, PDF, Immagine)</Label>
                <FileUpload
                  bucket="documents"
                  folder="athletic"
                  accept="audio/*,.pdf,.mp3,.wav,image/*"
                  onUpload={setFileUrl}
                  currentUrl={editing?.file_url}
                  label="Carica file audio/PDF"
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="is_published" defaultChecked={editing?.is_published ?? true} /> Pubblicato
                </label>
                <div><Label>Ordine</Label><Input name="sort_order" type="number" defaultValue={editing?.sort_order || 0} className="w-20" /></div>
              </div>
              <Button type="submit" disabled={saveMutation.isPending}>Salva</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {Object.entries(categories).map(([key, label]) => {
        const items = content?.filter((c) => c.category === key);
        if (!items?.length) return null;
        return (
          <div key={key} className="mb-6">
            <h2 className="font-heading font-bold text-lg mb-3">{label}</h2>
            <div className="space-y-2">
              {items.map((c) => (
                <Card key={c.id}>
                  <CardContent className="p-4 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{c.title}</h3>
                      {c.content && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{c.content}</p>}
                      {c.file_url && <a href={c.file_url} target="_blank" className="text-xs text-primary hover:underline mt-1 inline-block">📎 File allegato</a>}
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${c.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {c.is_published ? "Pubblicato" : "Bozza"}
                      </span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => { setEditing(c); setFileUrl(c.file_url || ""); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => { if (confirm("Eliminare?")) deleteMutation.mutate(c.id); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
      {(!content || content.length === 0) && <p className="text-center text-muted-foreground py-8">Nessun contenuto atletico. Aggiungi il primo!</p>}
    </AdminLayout>
  );
}
