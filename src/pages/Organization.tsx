import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { User, Shield, Eye } from "lucide-react";

function PersonCard({ name, role, delay }: { name: string; role: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay }}
      className="bg-card rounded-xl border p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center shrink-0"><User className="h-6 w-6" /></div>
      <div><h3 className="font-heading font-bold text-base">{name}</h3><p className="text-sm text-muted-foreground">{role}</p></div>
    </motion.div>
  );
}

export default function Organization() {
  const { data: staff } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const { data, error } = await supabase.from("staff_members").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const board = staff?.filter((s) => s.category === "board") || [];
  const collaborators = staff?.filter((s) => s.category === "collaborator") || [];
  const audit = staff?.filter((s) => s.category === "audit") || [];

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-heading font-extrabold mb-4">Organigramma</motion.h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">Le persone che guidano e supportano la Sezione AIA Lomellina</p>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8"><Shield className="h-7 w-7 text-primary" /><h2 className="text-2xl md:text-3xl font-heading font-bold">Consiglio Direttivo</h2></div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {board.map((p, i) => <PersonCard key={p.id} name={p.full_name} role={p.role} delay={i * 0.05} />)}
            </div>
          </div>
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8"><User className="h-7 w-7 text-primary" /><h2 className="text-2xl md:text-3xl font-heading font-bold">Collaboratori</h2></div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {collaborators.map((p, i) => <PersonCard key={p.id} name={p.full_name} role={p.role} delay={i * 0.05} />)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-8"><Eye className="h-7 w-7 text-primary" /><h2 className="text-2xl md:text-3xl font-heading font-bold">Organo di Controllo</h2></div>
            <div className="max-w-sm">{audit.map((p) => <PersonCard key={p.id} name={p.full_name} role={p.role} delay={0} />)}</div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
