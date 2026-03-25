import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";

export default function MembersDocuments() {
  const { data: docs } = useQuery({
    queryKey: ["member-documents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents").select("*").eq("is_published", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-heading font-extrabold">Documenti</h1>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-3xl space-y-3">
          {docs?.length === 0 && <p className="text-center text-muted-foreground">Nessun documento disponibile.</p>}
          {docs?.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{d.title}</h3>
                  {d.description && <p className="text-sm text-muted-foreground">{d.description}</p>}
                </div>
                <a href={d.file_url} target="_blank" className="text-primary hover:underline flex items-center gap-1 text-sm shrink-0">
                  <Download className="h-4 w-4" /> Scarica
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </Layout>
  );
}
