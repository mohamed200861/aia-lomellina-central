import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, FileText, AlertCircle } from "lucide-react";

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
          <p className="text-primary-foreground/80 mt-2">Centri convenzionati e istruzioni per la visita medica</p>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-4xl">
          <p className="text-foreground/80 mb-8 text-center text-lg">È possibile prenotare la visita medica presso i seguenti centri.</p>

          <div className="overflow-x-auto rounded-xl border mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="p-3 text-left">Centro</th>
                  <th className="p-3 text-left">Indirizzo</th>
                  <th className="p-3 text-left">Telefono</th>
                  <th className="p-3 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {centers?.map((c, i) => (
                  <tr key={c.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3 text-muted-foreground">{c.address}</td>
                    <td className="p-3">{c.phone && <a href={`tel:${c.phone.replace(/\//g, "")}`} className="text-primary hover:underline">{c.phone}</a>}</td>
                    <td className="p-3 text-muted-foreground">{c.instructions || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-heading font-bold text-lg mb-3 flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Documenti Necessari</h3>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li>• Modulo di richiesta, timbrato e firmato <strong>IN ORIGINALE</strong> dal Presidente di Sezione</li>
                <li>• Documento d'identità</li>
                <li>• Tessera sanitaria</li>
                <li>• Copia del certificato dell'anno precedente (se in possesso)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-secondary/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-heading font-bold text-lg mb-2">Importante</h3>
                  <p className="text-sm text-foreground/80">
                    Dopo aver ottenuto il certificato medico, è necessario <strong>caricarlo su SINFONIA</strong> e consegnare l'originale presso la segreteria sezionale.
                    Senza entrambi i passaggi, il nuovo certificato <strong>non sarà considerato valido</strong>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
