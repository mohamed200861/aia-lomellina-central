import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Clock, FileText, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MembersReports() {
  const { data: reports } = useQuery({
    queryKey: ["member-reports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("report_settings").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const cupReports = reports?.filter((r) => r.category.startsWith("CUP")) || [];
  const leagueReports = reports?.filter((r) => r.category.startsWith("Campionato")) || [];

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-heading font-extrabold">Invio Referti</h1>
          <p className="text-primary-foreground/80 mt-2">Istruzioni, destinatari e scadenze per l'invio dei referti gara</p>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          {/* Instructions */}
          <Card className="mb-8 border-secondary/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-heading font-bold text-lg mb-2">Istruzioni Importanti</h3>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    <li>• I referti devono <strong>sempre</strong> includere tra i destinatari l'email sezionale: <a href="mailto:referti@aialomellina.it" className="text-primary font-medium hover:underline">referti@aialomellina.it</a></li>
                    <li>• Anche quando si invia tramite portale, una copia va comunque inviata a referti@aialomellina.it</li>
                    <li>• Il modello di referto è scaricabile dall'area Documenti</li>
                    <li>• Per le gare infrasettimanali di campionato, la scadenza per l'invio è ore 12:00 del giorno successivo alla gara</li>
                  </ul>
                </div>
              </div>
              <a href="https://www.aia-figc.it" target="_blank" rel="noopener noreferrer">
                <Button className="mt-2"><ExternalLink className="h-4 w-4 mr-2" /> Portale Invio Referti AIA</Button>
              </a>
            </CardContent>
          </Card>

          {/* Cup matches */}
          {cupReports.length > 0 && (
            <Card className="mb-8">
              <CardHeader><CardTitle>Gare di Coppa</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-muted"><th className="p-3 text-left">Categoria</th><th className="p-3 text-left">Scadenza</th><th className="p-3 text-left">Email 1</th><th className="p-3 text-left">Email 2</th></tr></thead>
                    <tbody>
                      {cupReports.map((r, i) => (
                        <tr key={r.id} className={i % 2 ? "bg-muted/30" : ""}>
                          <td className="p-3 font-medium">{r.category.replace("CUP – ", "")}</td>
                          <td className="p-3 text-muted-foreground">{r.deadline}</td>
                          <td className="p-3"><a href={`mailto:${r.destination_email}`} className="text-primary hover:underline">{r.destination_email}</a></td>
                          <td className="p-3"><a href="mailto:referti@aialomellina.it" className="text-primary hover:underline">referti@aialomellina.it</a></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* League matches */}
          {leagueReports.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Gare di Campionato</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-muted"><th className="p-3 text-left">Categoria</th><th className="p-3 text-left">Scadenza</th><th className="p-3 text-left">Email 1</th><th className="p-3 text-left">Email 2</th></tr></thead>
                    <tbody>
                      {leagueReports.map((r, i) => (
                        <tr key={r.id} className={i % 2 ? "bg-muted/30" : ""}>
                          <td className="p-3 font-medium">{r.category.replace("Campionato – ", "")}</td>
                          <td className="p-3 text-muted-foreground">{r.deadline}</td>
                          <td className="p-3"><a href={`mailto:${r.destination_email}`} className="text-primary hover:underline">{r.destination_email}</a></td>
                          <td className="p-3"><a href="mailto:referti@aialomellina.it" className="text-primary hover:underline">referti@aialomellina.it</a></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {reports?.length === 0 && <p className="text-center text-muted-foreground">Nessuna istruzione disponibile al momento.</p>}
        </div>
      </section>
    </Layout>
  );
}
