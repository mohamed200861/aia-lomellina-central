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

      // Generate signed URLs for private bucket
      const withSignedUrls = await Promise.all(
        (data ?? []).map(async (d) => {
          if (d.file_url && !d.file_url.startsWith("http")) {
            const { data: signedData } = await supabase.storage
              .from("documents")
              .createSignedUrl(d.file_url, 3600);
            return { ...d, signed_url: signedData?.signedUrl ?? d.file_url };
          }
          // If already a full URL, try to extract path and sign it
          const match = d.file_url?.match(/\/storage\/v1\/object\/public\/documents\/(.+)/);
          if (match) {
            const { data: signedData } = await supabase.storage
              .from("documents")
              .createSignedUrl(decodeURIComponent(match[1]), 3600);
            return { ...d, signed_url: signedData?.signedUrl ?? d.file_url };
          }
          return { ...d, signed_url: d.file_url };
        })
      );
      return withSignedUrls;
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
                <a href={d.signed_url} target="_blank" className="text-primary hover:underline flex items-center gap-1 text-sm shrink-0">
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
