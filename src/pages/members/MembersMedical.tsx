import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, FileText } from "lucide-react";

export default function MembersMedical() {
  const { data: centers } = useQuery({
    queryKey: ["member-medical"],
    queryFn: async () => {
      const { data, error } = await supabase.from("medical_centers").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-heading font-extrabold">Certificati Medici</h1>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-3xl space-y-4">
          {centers?.length === 0 && <p className="text-center text-muted-foreground">Nessun centro configurato.</p>}
          {centers?.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-5">
                <h3 className="font-heading font-bold text-lg mb-2">{c.name}</h3>
                {c.address && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-4 w-4" /> {c.address}</p>}
                {c.phone && <p className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="h-4 w-4" /> {c.phone}</p>}
                {c.instructions && <p className="text-sm mt-2">{c.instructions}</p>}
                {c.required_docs && <p className="text-sm mt-2 text-muted-foreground"><FileText className="h-4 w-4 inline mr-1" />Documenti: {c.required_docs}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </Layout>
  );
}
