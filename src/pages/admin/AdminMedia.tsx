import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FileUpload from "@/components/admin/FileUpload";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Film, Image as ImageIcon, Music, ExternalLink } from "lucide-react";

export default function AdminMedia() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [filter, setFilter] = useState("all");
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
      if (values.id) {
        const { error } = await supabase.from("media").update(values).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("media").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-media"] }); setOpen(false); setEditing(null); setFileUrl(""); toast.success("Media salvato!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("media").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-media"] }); toast.success("Eliminato!"); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const type = fd.get("media_type") as string;
    const url = type === "youtube" ? (fd.get("youtube_url") as string) : fileUrl;
    if (!url) { toast.error("URL o file richiesto"); return; }
    const values: any = {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      file_url: url,
      media_type: type,
      gallery: fd.get("gallery") as string || null,
    };
    if (editing) values.id = editing.id;
    saveMutation.mutate(values);
  };

  const openEdit = (m: any) => { setEditing(m); setMediaType(m.media_type || "image"); setFileUrl(m.file_url); setOpen(true); };

  const filtered = media?.filter((m) => filter === "all" || m.media_type === filter);
  const galleries = [...new Set(media?.map((m) => m.gallery).filter(Boolean) || [])];

  const typeIcon = (type: string | null) => {
    if (type === "video") return <Film className="h-5 w-5" />;
    if (type === "youtube") return <ExternalLink className="h-5 w-5" />;
    if (type === "audio") return <Music className="h-5 w-5" />;
    return <ImageIcon className="h-5 w-5" />;
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Libreria Media</h1>
          <p className="text-muted-foreground">{media?.length || 0} elementi</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setFileUrl(""); setMediaType("image"); } }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Aggiungi Media</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Modifica Media" : "Aggiungi Media"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Titolo</Label><Input name="title" defaultValue={editing?.title} /></div>
              <div><Label>Tipo</Label>
                <select name="media_type" value={mediaType} onChange={(e) => setMediaType(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                  <option value="image">Immagine</option>
                  <option value="video">Video</option>
                  <option value="youtube">YouTube</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
              {mediaType === "youtube" ? (
                <div><Label>URL YouTube</Label><Input name="youtube_url" defaultValue={editing?.file_url} placeholder="https://youtube.com/watch?v=..." required /></div>
              ) : (
                <div>
                  <Label>File</Label>
                  <FileUpload
                    bucket="media"
                    folder={mediaType === "audio" ? "audio" : mediaType === "video" ? "video" : "images"}
                    accept={mediaType === "image" ? "image/*" : mediaType === "video" ? "video/*" : "audio/*"}
                    onUpload={setFileUrl}
                    currentUrl={editing?.file_url}
                    label={`Carica ${mediaType === "image" ? "immagine" : mediaType === "video" ? "video" : "audio"}`}
                  />
                </div>
              )}
              <div><Label>Galleria (opzionale)</Label><Input name="gallery" defaultValue={editing?.gallery} placeholder="Nome galleria" /></div>
              <div><Label>Descrizione</Label><Textarea name="description" defaultValue={editing?.description} rows={3} /></div>
              <Button type="submit" disabled={saveMutation.isPending}>Salva</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[{ v: "all", l: "Tutti" }, { v: "image", l: "Immagini" }, { v: "video", l: "Video" }, { v: "youtube", l: "YouTube" }, { v: "audio", l: "Audio" }].map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f.v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
          >
            {f.l}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered?.map((m) => (
          <Card key={m.id} className="overflow-hidden group">
            <div className="relative">
              {m.media_type === "image" ? (
                <img src={m.file_url} alt={m.title || ""} className="w-full h-44 object-cover" />
              ) : (
                <div className="w-full h-44 bg-muted flex flex-col items-center justify-center gap-2">
                  {typeIcon(m.media_type)}
                  <span className="text-xs text-muted-foreground capitalize">{m.media_type}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <Button size="sm" variant="secondary" onClick={() => openEdit(m)}><Pencil className="h-3 w-3" /></Button>
                <Button size="sm" variant="destructive" onClick={() => { if (confirm("Eliminare?")) deleteMutation.mutate(m.id); }}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
            <CardContent className="p-3">
              <p className="font-medium text-sm truncate">{m.title || "Senza titolo"}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground capitalize">{m.media_type}</span>
                {m.gallery && <span className="text-xs bg-accent px-1.5 py-0.5 rounded">{m.gallery}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filtered?.length === 0 && <p className="text-center text-muted-foreground py-12">Nessun media. Aggiungi il primo!</p>}
    </AdminLayout>
  );
}
