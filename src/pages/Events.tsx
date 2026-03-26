import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Calendar as CalIcon, MapPin, Clock } from "lucide-react";

export default function Events() {
  const { data: events } = useQuery({
    queryKey: ["public-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("is_published", true).order("event_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const upcoming = events?.filter((e) => new Date(e.event_date) >= new Date()) || [];
  const past = events?.filter((e) => new Date(e.event_date) < new Date()) || [];

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-heading font-extrabold mb-4">Eventi</motion.h1>
          <p className="text-lg text-primary-foreground/80">Calendario delle attività della sezione</p>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-4xl">
          {upcoming.length > 0 && (
            <>
              <h2 className="font-heading font-bold text-xl mb-6">Prossimi Eventi</h2>
              <div className="space-y-4 mb-12">
                {upcoming.map((event, i) => (
                  <motion.div key={event.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    className="flex bg-card rounded-xl border p-5 gap-5 hover:shadow-md transition-shadow">
                    <div className="bg-primary text-primary-foreground rounded-xl p-4 text-center min-w-[70px] h-fit">
                      <div className="text-2xl font-bold font-heading">{new Date(event.event_date).getDate()}</div>
                      <div className="text-xs uppercase">{new Date(event.event_date).toLocaleString("it-IT", { month: "short" })}</div>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg">{event.title}</h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        {event.event_time && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {event.event_time}</span>}
                        {event.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {event.location}</span>}
                      </div>
                      {event.description && <p className="text-sm mt-2 text-foreground/80">{event.description}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
          {past.length > 0 && (
            <>
              <h2 className="font-heading font-bold text-xl mb-4 text-muted-foreground">Eventi Passati</h2>
              <div className="space-y-3">
                {past.map((event) => (
                  <div key={event.id} className="bg-card rounded-lg border p-4 opacity-70 flex gap-4 items-center">
                    <CalIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <span className="font-medium text-sm">{event.title}</span>
                      <span className="text-xs text-muted-foreground ml-2">{new Date(event.event_date).toLocaleDateString("it-IT")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {(!events || events.length === 0) && (
            <div className="text-center py-12">
              <CalIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Nessun evento disponibile</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
