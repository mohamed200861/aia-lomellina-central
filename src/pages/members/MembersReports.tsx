import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Clock, FileText } from "lucide-react";

export default function MembersReports() {
  const { data: reports } = useQuery({
    queryKey: ["member-reports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("report_settings").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-heading font-extrabold">Referti Gara</h1>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-3xl space-y-4">
          {reports?.length === 0 && <p className="text-center text-muted-foreground">Nessuna istruzione disponibile al momento.</p>}
          {reports?.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-5">
                <h3 className="font-heading font-bold text-lg mb-3">{r.category}</h3>
                {r.instructions && <p className="text-sm mb-3 whitespace-pre-wrap">{r.instructions}</p>}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {r.destination_email && <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {r.destination_email}</span>}
                  {r.deadline && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Scadenza: {r.deadline}</span>}
                  {r.template_url && <a href={r.template_url} target="_blank" className="flex items-center gap-1 text-primary hover:underline"><FileText className="h-4 w-4" /> Scarica Modello</a>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </Layout>
  );
}
