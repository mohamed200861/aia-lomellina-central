import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Dumbbell } from "lucide-react";

export default function MembersAthletic() {
  const { data: content } = useQuery({
    queryKey: ["member-athletic"],
    queryFn: async () => {
      const { data, error } = await supabase.from("athletic_content").select("*").eq("is_published", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const categories: Record<string, string> = { "yo-yo": "Yo-Yo Test", sds: "SDS Test", training: "Programmi di Allenamento", plans: "Piani Atletici", general: "Generale" };

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-heading font-extrabold">Area Atletica</h1>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-3xl">
          {content?.length === 0 && <p className="text-center text-muted-foreground">Nessun contenuto disponibile.</p>}
          {Object.entries(categories).map(([key, label]) => {
            const items = content?.filter((c) => c.category === key);
            if (!items?.length) return null;
            return (
              <div key={key} className="mb-8">
                <h2 className="font-heading font-bold text-xl mb-4 flex items-center gap-2"><Dumbbell className="h-5 w-5 text-primary" /> {label}</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <h3 className="font-bold">{item.title}</h3>
                        {item.content && <p className="text-sm mt-1 whitespace-pre-wrap">{item.content}</p>}
                        {item.file_url && <a href={item.file_url} target="_blank" className="text-sm text-primary flex items-center gap-1 mt-2 hover:underline"><Download className="h-4 w-4" /> Scarica</a>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
