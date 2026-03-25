import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";

const referees = [
  "Marco BEDIN", "Oreste BOTTAZZO", "Oscar Luigi D'ADDIEGO", "Luca IUORIO",
  "Simone Pietro DEGRA'", "Giulio INCARBONE", "Alberto COLLI FRANZONE",
  "Nicholas LINO", "Matteo NASTA", "Luca CORDANI", "Hevan YOUSSEF",
  "Filippo Thomas RAGG", "Edoardo LEONE", "Filippo BRANCHINI",
  "Federica DE PAOLI", "Simone Emanuele DORONZO", "Federico ODIERNA",
  "Giulio Nicolas NECHIFOR",
].sort();

export default function RefereesList() {
  const [search, setSearch] = useState("");
  const filtered = referees.filter((r) => r.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
            Elenco Arbitri
          </motion.h1>
          <p className="text-lg text-primary-foreground/80">I nostri arbitri attivi nella sezione</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-3xl">
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca arbitro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="space-y-2">
            {filtered.map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-3 bg-card rounded-lg border p-4"
              >
                <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <span className="font-medium">{name}</span>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nessun arbitro trovato per "{search}"</p>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
