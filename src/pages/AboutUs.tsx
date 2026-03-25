import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Award, Heart, Target, Users } from "lucide-react";

export default function AboutUs() {
  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-heading font-extrabold mb-4"
          >
            Chi Siamo
          </motion.h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            L'Associazione Italiana Arbitri — Sezione di Lomellina, al servizio del calcio dal cuore della Lombardia.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4">La Nostra Storia</h2>
              <p className="text-foreground/80 leading-relaxed mb-6">
                La Sezione AIA di Lomellina è un punto di riferimento per la formazione e la gestione degli arbitri di calcio nel territorio lomellinese. Fondata con l'obiettivo di promuovere i valori dello sport e del fair play, la nostra sezione forma ogni anno decine di nuovi arbitri, accompagnandoli in un percorso di crescita personale e professionale.
              </p>
              <p className="text-foreground/80 leading-relaxed mb-6">
                Con sede a Vigevano, la sezione copre un vasto territorio della provincia di Pavia, gestendo centinaia di designazioni ogni settimana per campionati di ogni livello, dal settore giovanile al calcio a 11, passando per il futsal.
              </p>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mt-12">
            {[
              { icon: Target, title: "Missione", desc: "Formare arbitri competenti, promuovere il fair play e garantire il regolare svolgimento delle competizioni calcistiche." },
              { icon: Heart, title: "Valori", desc: "Integrità, imparzialità, rispetto, formazione continua e spirito di squadra." },
              { icon: Award, title: "Eccellenza", desc: "Numerosi nostri arbitri hanno raggiunto le categorie professionistiche, portando alto il nome della sezione." },
              { icon: Users, title: "Comunità", desc: "Una grande famiglia unita dalla passione per il calcio e dal desiderio di servire lo sport." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border p-6"
              >
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
