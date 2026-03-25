import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function MembersRTO() {
  const { data: rtos } = useQuery({
    queryKey: ["member-rto"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rto_dates").select("*").eq("is_published", true).order("rto_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const upcoming = rtos?.filter((r) => new Date(r.rto_date) >= new Date()) || [];
  const past = rtos?.filter((r) => new Date(r.rto_date) < new Date()) || [];

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-heading font-extrabold">Calendario RTO</h1>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-heading font-bold text-xl mb-4">Prossime RTO</h2>
          {upcoming.length === 0 && <p className="text-muted-foreground">Nessuna RTO in programma.</p>}
          <div className="space-y-3 mb-8">
            {upcoming.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4 flex gap-4 items-center">
                  <div className="bg-primary text-primary-foreground rounded-lg p-3 text-center min-w-[60px]">
                    <div className="text-lg font-bold">{new Date(r.rto_date).getDate()}</div>
                    <div className="text-xs">{new Date(r.rto_date).toLocaleString("it-IT", { month: "short" })}</div>
                  </div>
                  <div>
                    <h3 className="font-bold">{r.title}</h3>
                    <p className="text-sm text-muted-foreground">{r.rto_time && `${r.rto_time} • `}{r.location}</p>
                    {r.notes && <p className="text-sm mt-1">{r.notes}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {past.length > 0 && (
            <>
              <h2 className="font-heading font-bold text-xl mb-4">RTO Passate</h2>
              <div className="space-y-2">
                {past.map((r) => (
                  <Card key={r.id} className="opacity-60">
                    <CardContent className="p-3 flex gap-3 items-center">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{r.title} — {new Date(r.rto_date).toLocaleDateString("it-IT")}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
