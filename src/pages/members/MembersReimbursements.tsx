import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";

export default function MembersReimbursements() {
  const { data: rules } = useQuery({
    queryKey: ["member-reimbursements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reimbursement_rules").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // Pivot: group by distance_bracket, columns = roles
  const roles = ["A.E. SGS", "A.E. LND", "A.A.", "O.A.", "TUTOR"];
  const brackets = [...new Set(rules?.map((r) => r.distance_bracket) || [])];
  // Maintain sort order
  const sortedBrackets = brackets.sort((a, b) => {
    const aMin = parseInt(a.split("-")[0]) || 0;
    const bMin = parseInt(b.split("-")[0]) || 0;
    return aMin - bMin;
  });

  const getAmount = (bracket: string, role: string) => {
    const rule = rules?.find((r) => r.distance_bracket === bracket && r.role === role);
    return rule ? `${rule.amount} €` : "–";
  };

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-heading font-extrabold">Rimborsi Spese</h1>
          <p className="text-primary-foreground/80 mt-2">Tabella rimborsi per percorrenza andata/ritorno, ruolo e categoria</p>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          {sortedBrackets.length === 0 ? (
            <p className="text-center text-muted-foreground">Tabelle rimborsi non ancora configurate.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="p-3 text-left font-bold">PERCORRENZA a/r</th>
                    {roles.map((r) => <th key={r} className="p-3 text-center font-bold whitespace-nowrap">{r}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {sortedBrackets.map((bracket, i) => (
                    <tr key={bracket} className={i % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                      <td className="p-3 font-medium whitespace-nowrap">{bracket}</td>
                      {roles.map((role) => (
                        <td key={role} className="p-3 text-center font-bold">{getAmount(bracket, role)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
