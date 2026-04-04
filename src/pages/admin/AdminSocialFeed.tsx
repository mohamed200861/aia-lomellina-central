import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FileUpload from "@/components/admin/FileUpload";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminSocialFeed() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState("");
  const qc = useQueryClient();
  const { loading: authLoading, isAdmin } = useAuth();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-social-feed"],
    queryFn: async () => {
      const { data, error } = await supabase.from("social_posts").select("*").order("sort_order").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !authLoading && isAdmin,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (values.id) {
        const { id, ...rest } = values;
        const { error } = await supabase.from("social_posts").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("social_posts").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-social-feed"] });
      qc.invalidateQueries({ queryKey: ["public-social-feed"] });
      setOpen(false); setEditing(null); setImageUrl("");
      toast.success("Post salvato!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-social-feed"] });
      qc.invalidateQueries({ queryKey: ["public-social-feed"] });
      toast.success("Post eliminato!");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values: any = {
      platform: fd.get("platform") as string,
      caption: fd.get("caption") as string || null,
      post_date: fd.get("post_date") as string || null,
      external_url: fd.get("external_url") as string || null,
      image_url: imageUrl || null,
      is_published: fd.get("is_published") === "on",
    };
    if (editing) values.id = editing.id;
    saveMutation.mutate(values);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Social Feed</h1>
          <p className="text-muted-foreground">{posts?.length || 0} post</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setImageUrl(""); } }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Nuovo Post</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Modifica Post" : "Nuovo Post Social"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Piattaforma</Label>
                <select name="platform" defaultValue={editing?.platform || "facebook"} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter">X / Twitter</option>
                  <option value="telegram">Telegram</option>
                </select>
              </div>
              <div><Label>Didascalia</Label><Textarea name="caption" rows={3} defaultValue={editing?.caption || ""} /></div>
              <div><Label>Data Post</Label><Input name="post_date" type="date" defaultValue={editing?.post_date || ""} /></div>
              <div><Label>Link al Post</Label><Input name="external_url" type="url" defaultValue={editing?.external_url || ""} /></div>
              <div>
                <Label>Immagine</Label>
                <FileUpload bucket="media" folder="social" accept="image/*" onUpload={setImageUrl} currentUrl={editing?.image_url} label="Carica immagine" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_published" defaultChecked={editing?.is_published ?? true} /> Pubblicato
              </label>
              <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Salvataggio..." : "Salva"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts?.map((p) => (
          <Card key={p.id} className="overflow-hidden group">
            {p.image_url ? (
              <img src={p.image_url} alt="" className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-muted flex items-center justify-center text-3xl">
                {p.platform === "facebook" ? "📘" : p.platform === "instagram" ? "📸" : p.platform === "telegram" ? "✈️" : "🐦"}
              </div>
            )}
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-primary">{p.platform}</span>
                {p.post_date && <span className="text-xs text-muted-foreground">{new Date(p.post_date).toLocaleDateString("it-IT")}</span>}
              </div>
              {p.caption && <p className="text-sm line-clamp-2">{p.caption}</p>}
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => { setEditing(p); setImageUrl(p.image_url || ""); setOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                <Button size="sm" variant="destructive" onClick={() => { if (confirm("Eliminare?")) deleteMutation.mutate(p.id); }}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!isLoading && posts?.length === 0 && <p className="text-center text-muted-foreground py-12">Nessun post social. Aggiungi il primo!</p>}
    </AdminLayout>
  );
}
