import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";

export default function MembersCommunications() {
  const { data: comms } = useQuery({
    queryKey: ["member-communications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("internal_communications").select("*").eq("is_published", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-heading font-extrabold">Comunicazioni Interne</h1>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-3xl space-y-4">
          {comms?.length === 0 && <p className="text-center text-muted-foreground">Nessuna comunicazione.</p>}
          {comms?.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-5">
                <h3 className="font-heading font-bold text-lg">{c.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">{new Date(c.created_at).toLocaleDateString("it-IT")}</p>
                {c.content && <p className="text-sm whitespace-pre-wrap">{c.content}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </Layout>
  );
}
