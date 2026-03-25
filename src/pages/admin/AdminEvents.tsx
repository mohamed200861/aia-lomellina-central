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

export default function AdminEvents() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const qc = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (values.id) {
        const { error } = await supabase.from("events").update(values).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-events"] });
      setOpen(false);
      setEditing(null);
      toast.success("Evento salvato!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Evento eliminato!");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values: any = {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      event_date: fd.get("event_date") as string,
      event_time: fd.get("event_time") as string,
      location: fd.get("location") as string,
      is_published: fd.get("is_published") === "on",
    };
    if (editing) values.id = editing.id;
    saveMutation.mutate(values);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Gestione Eventi</h1>
          <p className="text-muted-foreground">Crea e gestisci gli eventi della sezione</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nuovo Evento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Modifica Evento" : "Nuovo Evento"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Titolo</Label>
                <Input id="title" name="title" defaultValue={editing?.title} required />
              </div>
              <div>
                <Label htmlFor="description">Descrizione</Label>
                <Textarea id="description" name="description" defaultValue={editing?.description} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event_date">Data</Label>
                  <Input id="event_date" name="event_date" type="date" defaultValue={editing?.event_date} required />
                </div>
                <div>
                  <Label htmlFor="event_time">Ora</Label>
                  <Input id="event_time" name="event_time" defaultValue={editing?.event_time} placeholder="20:30" />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Luogo</Label>
                <Input id="location" name="location" defaultValue={editing?.location} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_published" defaultChecked={editing?.is_published ?? true} />
                Pubblicato
              </label>
              <Button type="submit" disabled={saveMutation.isPending}>Salva</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {isLoading && <p>Caricamento...</p>}
        {events?.map((ev) => (
          <Card key={ev.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold">{ev.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(ev.event_date).toLocaleDateString("it-IT")} {ev.event_time && `• ${ev.event_time}`} {ev.location && `• ${ev.location}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditing(ev); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { if (confirm("Eliminare?")) deleteMutation.mutate(ev.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {events?.length === 0 && <p className="text-muted-foreground text-center py-8">Nessun evento.</p>}
      </div>
    </AdminLayout>
  );
}
