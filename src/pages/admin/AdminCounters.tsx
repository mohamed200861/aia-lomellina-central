import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Award, Calendar, TrendingUp, Loader2, Save } from "lucide-react";
import { useState, useEffect } from "react";

const ICON_MAP: Record<string, React.ElementType> = { Users, Award, Calendar, TrendingUp };

interface Counter {
  id: string;
  value: number;
  suffix: string;
  label: string;
  icon_name: string | null;
  sort_order: number;
  is_active: boolean;
  auto_sync_table: string | null;
}

export default function AdminCounters() {
  const qc = useQueryClient();
  const [editState, setEditState] = useState<Record<string, Partial<Counter>>>({});

  const { data: counters = [], isLoading } = useQuery({
    queryKey: ["admin-counters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_counters" as any)
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data as unknown as Counter[]) ?? [];
    },
  });

  const { data: refereesCount } = useQuery({
    queryKey: ["referees-count-for-sync"],
    queryFn: async () => {
      const { count } = await supabase.from("referees").select("*", { count: "exact", head: true }).eq("is_active", true);
      return count ?? 0;
    },
  });

  // Initialize edit state when counters load
  useEffect(() => {
    if (counters.length > 0 && Object.keys(editState).length === 0) {
      const state: Record<string, Partial<Counter>> = {};
      counters.forEach(c => { state[c.id] = { ...c }; });
      setEditState(state);
    }
  }, [counters]);

  const updateMutation = useMutation({
    mutationFn: async (counter: Partial<Counter> & { id: string }) => {
      const { id, ...values } = counter;
      // Remove fields that shouldn't be sent
      delete (values as any).created_at;
      delete (values as any).updated_at;
      const { error } = await (supabase.from("homepage_counters" as any) as any).update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-counters"] });
      qc.invalidateQueries({ queryKey: ["homepage-counters"] });
      toast.success("Contatore salvato!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleChange = (id: string, field: string, value: any) => {
    setEditState(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = (id: string) => {
    const state = editState[id];
    if (!state) return;
    updateMutation.mutate({ id, ...state });
  };

  const handleSaveAll = () => {
    Object.keys(editState).forEach(id => {
      const state = editState[id];
      if (state) updateMutation.mutate({ id, ...state });
    });
  };

  if (isLoading) return <AdminLayout><p>Caricamento...</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-heading font-bold">Contatori Homepage</h1>
          <p className="text-muted-foreground">Gestisci le statistiche visualizzate nella homepage</p>
        </div>
        <Button onClick={handleSaveAll} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Salva Tutto
        </Button>
      </div>

      <div className="grid gap-4 max-w-3xl">
        {counters.map((counter) => {
          const state = editState[counter.id] || counter;
          const IconComp = ICON_MAP[state.icon_name || ""] || Users;
          const isAutoSync = state.auto_sync_table === "referees";

          return (
            <Card key={counter.id} className={!state.is_active ? "opacity-60" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Icon preview */}
                  <div className="bg-primary text-primary-foreground w-14 h-14 rounded-xl flex items-center justify-center shrink-0">
                    <IconComp className="h-7 w-7" />
                  </div>

                  <div className="flex-1 space-y-3">
                    {/* Label */}
                    <div>
                      <Label className="text-xs text-muted-foreground">Etichetta</Label>
                      <Input
                        value={state.label || ""}
                        onChange={e => handleChange(counter.id, "label", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Value */}
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Valore {isAutoSync ? `(auto: ${refereesCount})` : ""}
                        </Label>
                        <Input
                          type="number"
                          value={isAutoSync ? (refereesCount ?? state.value) : (state.value ?? 0)}
                          onChange={e => handleChange(counter.id, "value", parseInt(e.target.value) || 0)}
                          disabled={isAutoSync}
                        />
                      </div>

                      {/* Suffix */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Suffisso</Label>
                        <Input
                          value={state.suffix || ""}
                          onChange={e => handleChange(counter.id, "suffix", e.target.value)}
                          placeholder="+"
                        />
                      </div>

                      {/* Sort order */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Ordine</Label>
                        <Input
                          type="number"
                          value={state.sort_order ?? 0}
                          onChange={e => handleChange(counter.id, "sort_order", parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Icon */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Icona</Label>
                        <Select
                          value={state.icon_name || "Users"}
                          onValueChange={v => handleChange(counter.id, "icon_name", v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Users">Users</SelectItem>
                            <SelectItem value="Award">Award</SelectItem>
                            <SelectItem value="Calendar">Calendar</SelectItem>
                            <SelectItem value="TrendingUp">TrendingUp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Auto-sync (only for first counter) */}
                      {counter.sort_order === 1 && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Modalità valore</Label>
                          <Select
                            value={state.auto_sync_table || "manual"}
                            onValueChange={v => handleChange(counter.id, "auto_sync_table", v === "manual" ? null : v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manual">Manuale</SelectItem>
                              <SelectItem value="referees">Auto da Organico</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={state.is_active ?? true}
                          onCheckedChange={v => handleChange(counter.id, "is_active", v)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {state.is_active ? "Visibile" : "Nascosto"}
                        </span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleSave(counter.id)} disabled={updateMutation.isPending}>
                        Salva
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AdminLayout>
  );
}
