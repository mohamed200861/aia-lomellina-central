import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Award, Heart, Target, Users } from "lucide-react";

export default function AboutUs() {
  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
            Chi Siamo
          </motion.h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            L'Associazione Italiana Arbitri — Sezione di Lomellina, al servizio del calcio dal cuore della Lombardia.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">La Nostra Storia</h2>
            <div className="bg-card rounded-2xl border p-8 mb-10 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-secondary text-secondary-foreground rounded-full px-4 py-1 text-sm font-bold">2012</div>
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm text-muted-foreground font-medium">Nascita della Sezione Lomellina</span>
              </div>
              <div className="text-foreground/80 leading-relaxed space-y-4 text-[15px]">
                <p>Il Comitato Nazionale, nella riunione del 22 marzo, ha deliberato la soppressione delle Sezioni di Mortara e Vigevano che vengono accorpate prendendo il nome di Sezione "Lomellina".</p>
                <p>La nuova realtà sezionale della Lomellina riunirà, a far data dal 1 maggio 2012, le competenze delle Sezioni di Vigevano (59 associati) e di Mortara (74 associati): due località poste a pochi chilometri di distanza (12) e ubicate nella provincia di Pavia, nella zona geografica compresa tra i fiumi Po, Ticino e Sesia, denominata appunto Lomellina.</p>
                <p>Il percorso che ha portato a questa fusione parte da molto lontano: se ne parlava da almeno 15 anni, con ipotesi di aggregazione che mai erano andate a buon fine. Questa volta il processo decisionale è partito proprio dalle Sezioni, con una delibera che i due Consigli Direttivi hanno portato all'attenzione della Consulta Regionale che, approvata all'unanimità da tutti i Presidenti delle sezioni della Lombardia, è stata sottoposta al vaglio del Comitato Nazionale dell'AIA.</p>
                <p>Già da qualche mese si erano programmate Lezioni Tecniche e sedute di allenamento in comune, più volte i Componenti dei Consigli Direttivi si erano già incontrati per migliorare la conoscenza reciproca e per definire i dettagli del progetto.</p>
                <p>Con qualche piccolo sacrificio da parte di ciascuno si sono posti obiettivi importanti: la nuova Sezione avrà a disposizione maggiori risorse sia in termini finanziari che, soprattutto, in forma di risorse umane e dirigenziali; la maggior forza numerica permetterà di meglio organizzare le attività tecniche e associative e di trasmettere entusiasmo e nuove motivazioni ai ragazzi.</p>
                <p>Potrà anche essere razionalizzata la gestione delle designazioni sul territorio, con un migliore supporto all'attività della Delegazione FIGC-LND di Pavia.</p>
                <p>I due Presidenti artefici dell'iniziativa, Gianluca Tacchino di Mortara e Alessandro Garavaglia di Vigevano, supportati dall'attività di coordinamento del Presidente del CRA Lombardia, Alberto Zaroli, continueranno a restare al "vertice" fino alle nuove elezioni quando gli Arbitri della Sezione Lomellina sceglieranno il primo Presidente della loro storia.</p>
              </div>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 mt-12">
            {[
              { icon: Target, title: "Missione", desc: "Formare arbitri competenti, promuovere il fair play e garantire il regolare svolgimento delle competizioni calcistiche." },
              { icon: Heart, title: "Valori", desc: "Integrità, imparzialità, rispetto, formazione continua e spirito di squadra." },
              { icon: Award, title: "Eccellenza", desc: "Numerosi nostri arbitri hanno raggiunto le categorie professionistiche, portando alto il nome della sezione." },
              { icon: Users, title: "Comunità", desc: "Una grande famiglia unita dalla passione per il calcio e dal desiderio di servire lo sport." },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border p-6">
                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
