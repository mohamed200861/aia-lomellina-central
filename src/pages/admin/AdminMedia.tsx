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
import { Plus, Trash2, Image as ImageIcon, Film } from "lucide-react";

export default function AdminMedia() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: media } = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () => {
      const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase.from("media").insert(values);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-media"] }); setOpen(false); toast.success("Media aggiunto!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("media").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-media"] }); toast.success("Eliminato!"); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveMutation.mutate({
      title: fd.get("title") as string,
      file_url: fd.get("file_url") as string,
      media_type: fd.get("media_type") as string,
      gallery: fd.get("gallery") as string,
      description: fd.get("description") as string,
    });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-heading font-bold">Gestione Media</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Aggiungi</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Aggiungi Media</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Titolo</Label><Input name="title" /></div>
              <div><Label>URL File / YouTube</Label><Input name="file_url" required placeholder="https://..." /></div>
              <div><Label>Tipo</Label>
                <select name="media_type" className="w-full border rounded-md px-3 py-2 text-sm">
                  <option value="image">Immagine</option>
                  <option value="video">Video</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>
              <div><Label>Galleria</Label><Input name="gallery" placeholder="Nome galleria (opzionale)" /></div>
              <div><Label>Descrizione</Label><Input name="description" /></div>
              <Button type="submit">Salva</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {media?.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-3">
              {m.media_type === "image" ? (
                <img src={m.file_url} alt={m.title || ""} className="w-full h-40 object-cover rounded mb-2" />
              ) : (
                <div className="w-full h-40 bg-muted rounded mb-2 flex items-center justify-center">
                  <Film className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium truncate">{m.title || "Senza titolo"}</span>
                <Button size="sm" variant="destructive" onClick={() => { if (confirm("Eliminare?")) deleteMutation.mutate(m.id); }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
