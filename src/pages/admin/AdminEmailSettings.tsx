import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type EmailTemplateRecord = {
  id: string;
  template_key: string;
  name: string;
  subject: string;
  heading: string | null;
  body: string;
  cta_label: string | null;
  footer_note: string | null;
  is_enabled: boolean;
};

type EmailLogRecord = {
  id: string;
  message_id: string | null;
  template_name: string | null;
  recipient_email: string | null;
  status: string | null;
  error_message: string | null;
  created_at: string;
};

const rangePresets = [
  { key: "24h", label: "24h", days: 1 },
  { key: "7d", label: "7 giorni", days: 7 },
  { key: "30d", label: "30 giorni", days: 30 },
] as const;

const statusLabelMap: Record<string, string> = {
  sent: "Sent",
  failed: "Failed",
  dlq: "Failed",
  suppressed: "Suppressed",
  pending: "Pending",
};

export default function AdminEmailSettings() {
  const qc = useQueryClient();
  const [selectedRange, setSelectedRange] = useState<(typeof rangePresets)[number]["key"] | "custom">("7d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data: settings } = useQuery({
    queryKey: ["email-settings-site"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").limit(1).single();
      if (error) throw error;
      return data as Record<string, any>;
    },
  });

  const { data: templates } = useQuery({
    queryKey: ["email-settings-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates" as never)
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return (data ?? []) as unknown as EmailTemplateRecord[];
    },
  });

  const { data: emailLogState } = useQuery({
    queryKey: ["email-log-state"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_send_log" as never)
        .select("id, message_id, template_name, recipient_email, status, error_message, created_at")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) {
        const message = String(error.message || "");
        if (message.includes("does not exist")) {
          return { available: false, rows: [] as EmailLogRecord[] };
        }

        throw error;
      }

      return { available: true, rows: (data ?? []) as unknown as EmailLogRecord[] };
    },
  });

  const saveSettings = useMutation({
    mutationFn: async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const values: Record<string, string | boolean> = {};

      formData.forEach((value, key) => {
        values[key] = value as string;
      });

      values.email_confirm_course = formData.get("email_confirm_course") === "on";
      values.email_confirm_contact = formData.get("email_confirm_contact") === "on";
      values.email_confirm_absence = formData.get("email_confirm_absence") === "on";
      values.email_confirm_welcome = formData.get("email_confirm_welcome") === "on";

      const { error } = await supabase.from("site_settings").update(values as any).eq("id", settings?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["email-settings-site"] });
      toast.success("Impostazioni email salvate.");
    },
    onError: (error: any) => toast.error(error.message || "Errore nel salvataggio."),
  });

  const saveTemplate = useMutation({
    mutationFn: async (template: EmailTemplateRecord) => {
      const { error } = await supabase
        .from("email_templates" as never)
        .update({
          subject: template.subject,
          heading: template.heading,
          body: template.body,
          cta_label: template.cta_label,
          footer_note: template.footer_note,
          is_enabled: template.is_enabled,
        } as never)
        .eq("id", template.id);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["email-settings-templates"] });
      toast.success("Template aggiornato.");
    },
    onError: (error: any) => toast.error(error.message || "Errore nel salvataggio del template."),
  });

  const dateRange = useMemo(() => {
    if (selectedRange === "custom") {
      const start = customStart ? new Date(`${customStart}T00:00:00`) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const end = customEnd ? new Date(`${customEnd}T23:59:59`) : new Date();
      return { start, end };
    }

    const preset = rangePresets.find((item) => item.key === selectedRange) ?? rangePresets[1];
    return {
      start: new Date(Date.now() - preset.days * 24 * 60 * 60 * 1000),
      end: new Date(),
    };
  }, [customEnd, customStart, selectedRange]);

  const latestLogs = useMemo(() => {
    const rows = emailLogState?.rows ?? [];
    const deduped = new Map<string, EmailLogRecord>();

    rows.forEach((row) => {
      const key = row.message_id || row.id;
      if (!deduped.has(key)) deduped.set(key, row);
    });

    return Array.from(deduped.values());
  }, [emailLogState?.rows]);

  const availableTemplateNames = useMemo(
    () => Array.from(new Set(latestLogs.map((row) => row.template_name).filter(Boolean))).sort(),
    [latestLogs]
  );

  const filteredLogs = useMemo(() => {
    const rows = latestLogs.filter((row) => {
      const createdAt = new Date(row.created_at).getTime();
      const inRange = createdAt >= dateRange.start.getTime() && createdAt <= dateRange.end.getTime();
      const templateMatch = templateFilter === "all" || row.template_name === templateFilter;
      const normalizedStatus = row.status === "dlq" ? "failed" : row.status;
      const statusMatch = statusFilter === "all" || normalizedStatus === statusFilter;
      return inRange && templateMatch && statusMatch;
    });

    return rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [dateRange.end, dateRange.start, latestLogs, statusFilter, templateFilter]);

  const summary = useMemo(() => {
    return filteredLogs.reduce(
      (acc, row) => {
        acc.total += 1;
        if (row.status === "sent") acc.sent += 1;
        if (row.status === "pending") acc.pending += 1;
        if (row.status === "suppressed") acc.suppressed += 1;
        if (row.status === "failed" || row.status === "dlq") acc.failed += 1;
        return acc;
      },
      { total: 0, sent: 0, pending: 0, failed: 0, suppressed: 0 }
    );
  }, [filteredLogs]);

  const paginatedLogs = filteredLogs.slice((page - 1) * 50, page * 50);
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / 50));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Email Settings</h1>
          <p className="text-muted-foreground">Gestisci destinatari, conferme utente, template e stato consegna delle app email.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configurazione notifiche</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(event) => saveSettings.mutate(event)}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Destinatario principale</label>
                  <Input name="notification_email_primary" defaultValue={settings?.notification_email_primary || settings?.email || ""} />
                </div>
                <div>
                  <label className="text-sm font-medium">Destinatario secondario</label>
                  <Input name="notification_email_secondary" defaultValue={settings?.notification_email_secondary || ""} />
                </div>
                <div>
                  <label className="text-sm font-medium">Sender name</label>
                  <Input name="sender_name" defaultValue={settings?.sender_name || settings?.site_name || "Sezione AIA Lomellina"} />
                </div>
                <div>
                  <label className="text-sm font-medium">Sender email</label>
                  <Input name="sender_email" defaultValue={settings?.sender_email || settings?.email || ""} />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { name: "email_confirm_course", label: "Conferma iscrizione corso", checked: settings?.email_confirm_course !== false },
                  { name: "email_confirm_contact", label: "Conferma form contatti", checked: settings?.email_confirm_contact !== false },
                  { name: "email_confirm_absence", label: "Conferma giustificazioni", checked: settings?.email_confirm_absence !== false },
                  { name: "email_confirm_welcome", label: "Welcome / conferma account", checked: settings?.email_confirm_welcome !== false },
                ].map((item) => (
                  <label key={item.name} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm">
                    <input type="checkbox" name={item.name} defaultChecked={item.checked} className="h-4 w-4 accent-current" />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>

              <Button type="submit" disabled={saveSettings.isPending}>{saveSettings.isPending ? "Salvataggio..." : "Salva impostazioni email"}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Template email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {templates?.map((template) => (
              <form
                key={template.id}
                className="rounded-xl border bg-card p-4 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  saveTemplate.mutate({
                    ...template,
                    subject: String(form.get("subject") || ""),
                    heading: String(form.get("heading") || ""),
                    body: String(form.get("body") || ""),
                    cta_label: String(form.get("cta_label") || ""),
                    footer_note: String(form.get("footer_note") || ""),
                    is_enabled: form.get("is_enabled") === "on",
                  });
                }}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-xs text-muted-foreground">{template.template_key}</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="is_enabled" defaultChecked={template.is_enabled} className="h-4 w-4 accent-current" />
                    Attivo
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Oggetto</label>
                    <Input name="subject" defaultValue={template.subject} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Heading</label>
                    <Input name="heading" defaultValue={template.heading || ""} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Corpo</label>
                  <Textarea name="body" rows={6} defaultValue={template.body} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">CTA label</label>
                    <Input name="cta_label" defaultValue={template.cta_label || ""} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nota footer</label>
                    <Input name="footer_note" defaultValue={template.footer_note || ""} />
                  </div>
                </div>
                <Button type="submit" size="sm" disabled={saveTemplate.isPending}>{saveTemplate.isPending ? "Salvataggio..." : "Salva template"}</Button>
              </form>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stato consegna</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!emailLogState?.available ? (
              <div className="rounded-xl border bg-muted/50 p-4 text-sm text-muted-foreground">
                Le app email non sono ancora attive: configura prima il dominio mittente per sbloccare tracking, invio reale e storico consegne.
              </div>
            ) : (
              <>
                <div className="flex gap-2 flex-wrap">
                  {rangePresets.map((preset) => (
                    <Button
                      key={preset.key}
                      type="button"
                      variant={selectedRange === preset.key ? "default" : "outline"}
                      onClick={() => {
                        setSelectedRange(preset.key);
                        setPage(1);
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                  <Button type="button" variant={selectedRange === "custom" ? "default" : "outline"} onClick={() => setSelectedRange("custom")}>Custom</Button>
                </div>

                {selectedRange === "custom" && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input type="date" value={customStart} onChange={(e) => { setCustomStart(e.target.value); setPage(1); }} />
                    <Input type="date" value={customEnd} onChange={(e) => { setCustomEnd(e.target.value); setPage(1); }} />
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-3">
                  <select value={templateFilter} onChange={(e) => { setTemplateFilter(e.target.value); setPage(1); }} className="border rounded-md px-3 py-2 text-sm bg-background">
                    <option value="all">Tutti i template</option>
                    {availableTemplateNames.map((name) => <option key={name} value={name || ""}>{name}</option>)}
                  </select>
                  <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="border rounded-md px-3 py-2 text-sm bg-background">
                    <option value="all">Tutti gli stati</option>
                    <option value="sent">Sent</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="suppressed">Suppressed</option>
                  </select>
                  <div className="text-sm text-muted-foreground flex items-center">{filteredLogs.length} email uniche nel range selezionato</div>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  {[
                    { label: "Totale", value: summary.total },
                    { label: "Sent", value: summary.sent },
                    { label: "Pending", value: summary.pending },
                    { label: "Failed / Suppressed", value: summary.failed + summary.suppressed },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border bg-card px-4 py-3">
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="overflow-auto rounded-xl border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="px-4 py-3">Template</th>
                        <th className="px-4 py-3">Recipient</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">Errore</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLogs.map((log) => {
                        const normalizedStatus = log.status === "dlq" ? "failed" : log.status || "pending";
                        return (
                          <tr key={log.id} className="border-t align-top">
                            <td className="px-4 py-3">{log.template_name || "—"}</td>
                            <td className="px-4 py-3">{log.recipient_email || "—"}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-2 py-1 text-xs ${normalizedStatus === "sent" ? "bg-secondary text-secondary-foreground" : normalizedStatus === "pending" ? "bg-accent text-accent-foreground" : normalizedStatus === "suppressed" ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive"}`}>
                                {statusLabelMap[log.status || normalizedStatus] || normalizedStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">{new Date(log.created_at).toLocaleString("it-IT")}</td>
                            <td className="px-4 py-3 text-muted-foreground">{log.error_message || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between gap-3">
                    <Button type="button" variant="outline" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Precedente</Button>
                    <span className="text-sm text-muted-foreground">Pagina {page} di {totalPages}</span>
                    <Button type="button" variant="outline" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Successiva</Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}