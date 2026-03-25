import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Search, Newspaper } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const categories = ["Tutti", "Corso", "Riunioni", "Regolamento", "Comunicati", "Futsal"];

const allNews = [
  { title: "Apertura Iscrizioni Corso Arbitri 2026", date: "20 Mar 2026", cat: "Corso", excerpt: "Sono ufficialmente aperte le iscrizioni per il nuovo corso arbitri della Sezione AIA Lomellina. Il corso è gratuito e aperto a tutti i maggiori di 14 anni." },
  { title: "Riunione Tecnica Mensile — Aprile", date: "15 Mar 2026", cat: "Riunioni", excerpt: "La prossima riunione tecnica si terrà il 5 aprile alle 20:30 presso la sede di Vigevano. Presenza obbligatoria per tutti gli arbitri attivi." },
  { title: "Nuove Regole del Gioco: Aggiornamento IFAB", date: "10 Mar 2026", cat: "Regolamento", excerpt: "L'IFAB ha approvato importanti modifiche alle regole del gioco che entreranno in vigore dalla prossima stagione." },
  { title: "Risultati Test Atletici Primaverili", date: "5 Mar 2026", cat: "Comunicati", excerpt: "Pubblicati i risultati dei test atletici primaverili. Complimenti a tutti gli arbitri che hanno superato le prove." },
  { title: "Torneo di Futsal AIA Lomellina", date: "1 Mar 2026", cat: "Futsal", excerpt: "Grande successo per il torneo di futsal organizzato dalla nostra sezione. Oltre 50 partecipanti e tanti gol." },
  { title: "Comunicato Stagione Sportiva 2025/2026", date: "20 Feb 2026", cat: "Comunicati", excerpt: "Tutti i dettagli sulla nuova stagione sportiva, calendari, scadenze e novità regolamentari." },
];

export default function News() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("Tutti");

  const filtered = allNews.filter((n) => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCat === "Tutti" || n.cat === activeCat;
    return matchSearch && matchCat;
  });

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
            News
          </motion.h1>
          <p className="text-lg text-primary-foreground/80">Comunicati, aggiornamenti e notizie dalla sezione</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cerca news..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={activeCat === cat ? "default" : "outline"}
                  onClick={() => setActiveCat(cat)}
                  className={activeCat === cat ? "bg-primary text-primary-foreground" : ""}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {filtered.map((news, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-medium bg-accent text-accent-foreground px-2 py-0.5 rounded-full">{news.cat}</span>
                  <span className="text-xs text-muted-foreground">{news.date}</span>
                </div>
                <h2 className="font-heading font-bold text-lg mb-2">{news.title}</h2>
                <p className="text-sm text-muted-foreground">{news.excerpt}</p>
              </motion.article>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Newspaper className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Nessuna news trovata</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
