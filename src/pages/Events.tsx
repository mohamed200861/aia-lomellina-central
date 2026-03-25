import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Calendar as CalIcon, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const months = ["Tutti", "Marzo", "Aprile", "Maggio", "Giugno"];

const events = [
  { title: "Riunione Tecnica Arbitri", date: "5 Aprile 2026", time: "20:30", location: "Sede AIA Vigevano", month: "Aprile" },
  { title: "Corso Aggiornamento Futsal", date: "12 Aprile 2026", time: "18:00", location: "Palazzetto dello Sport", month: "Aprile" },
  { title: "Raduno Atletico Primaverile", date: "20 Aprile 2026", time: "09:00", location: "Campo Sportivo Comunale", month: "Aprile" },
  { title: "Assemblea Ordinaria Sezionale", date: "3 Maggio 2026", time: "15:00", location: "Sede AIA Vigevano", month: "Maggio" },
  { title: "Test Atletici di Fine Stagione", date: "17 Maggio 2026", time: "08:30", location: "Pista di Atletica", month: "Maggio" },
  { title: "Cena Sociale di Fine Stagione", date: "7 Giugno 2026", time: "20:00", location: "Ristorante Il Moro, Vigevano", month: "Giugno" },
  { title: "Riunione Tecnica Straordinaria", date: "25 Marzo 2026", time: "20:30", location: "Sede AIA Vigevano", month: "Marzo" },
];

export default function Events() {
  const [activeMonth, setActiveMonth] = useState("Tutti");
  const filtered = events.filter((e) => activeMonth === "Tutti" || e.month === activeMonth);

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
            Eventi
          </motion.h1>
          <p className="text-lg text-primary-foreground/80">Calendario delle attività della sezione</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-wrap gap-2 mb-8">
            {months.map((m) => (
              <Button
                key={m}
                size="sm"
                variant={activeMonth === m ? "default" : "outline"}
                onClick={() => setActiveMonth(m)}
                className={activeMonth === m ? "bg-primary text-primary-foreground" : ""}
              >
                {m}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {filtered.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex bg-card rounded-xl border p-5 gap-5 hover:shadow-md transition-shadow"
              >
                <div className="bg-primary text-primary-foreground rounded-xl p-4 text-center min-w-[70px] h-fit">
                  <div className="text-2xl font-bold font-heading">{event.date.split(" ")[0]}</div>
                  <div className="text-xs uppercase">{event.date.split(" ")[1]}</div>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg">{event.title}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {event.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {event.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <CalIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Nessun evento per questo periodo</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
