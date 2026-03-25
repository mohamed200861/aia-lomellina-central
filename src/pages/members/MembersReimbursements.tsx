import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";

export default function MembersReimbursements() {
  const { data: rules } = useQuery({
    queryKey: ["member-reimbursements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reimbursement_rules").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const categories = [...new Set(rules?.map((r) => r.category) || [])];

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-heading font-extrabold">Rimborsi Spese</h1>
          <p className="text-primary-foreground/80 mt-2">Tabelle rimborsi per categoria e distanza</p>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-4xl">
          {categories.length === 0 && <p className="text-center text-muted-foreground">Tabelle rimborsi non ancora configurate.</p>}
          {categories.map((cat) => (
            <div key={cat} className="mb-8">
              <h2 className="font-heading font-bold text-xl mb-4">{cat}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-lg overflow-hidden">
                  <thead><tr className="bg-primary text-primary-foreground"><th className="p-3 text-left">Ruolo</th><th className="p-3 text-left">Distanza A/R</th><th className="p-3 text-right">Importo</th></tr></thead>
                  <tbody>
                    {rules?.filter((r) => r.category === cat).map((r, i) => (
                      <tr key={r.id} className={i % 2 === 0 ? "bg-background" : "bg-muted"}>
                        <td className="p-3">{r.role}</td>
                        <td className="p-3">{r.distance_bracket}</td>
                        <td className="p-3 text-right font-bold">€{r.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
