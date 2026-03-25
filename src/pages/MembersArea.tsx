import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Lock, FileText, CreditCard, Calendar, ClipboardList, Image } from "lucide-react";

const tools = [
  { icon: FileText, title: "Comunicati Ufficiali", desc: "Consulta gli ultimi comunicati e circolari della sezione." },
  { icon: CreditCard, title: "Rimborsi Spese", desc: "Verifica lo stato dei tuoi rimborsi e le note spese." },
  { icon: Calendar, title: "Designazioni", desc: "Controlla le tue prossime designazioni arbitrali." },
  { icon: ClipboardList, title: "RTO", desc: "Accedi alla riunione tecnica online e ai materiali." },
  { icon: Image, title: "Media Riservati", desc: "Foto e video riservati agli associati." },
  { icon: Lock, title: "Documenti", desc: "Regolamenti, moduli e documentazione ufficiale." },
];

export default function MembersArea() {
  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
            Area Associati
          </motion.h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Servizi e strumenti riservati agli arbitri della sezione
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-accent/50 rounded-2xl p-8 mb-12 text-center border">
            <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold mb-2">Accesso Riservato</h2>
            <p className="text-muted-foreground mb-4">
              Questa sezione è riservata agli associati. L'autenticazione sarà disponibile prossimamente.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl border p-6 hover:shadow-md transition-shadow"
              >
                <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <tool.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-base mb-1">{tool.title}</h3>
                <p className="text-sm text-muted-foreground">{tool.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
