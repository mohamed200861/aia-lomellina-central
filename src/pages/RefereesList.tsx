import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function RefereesList() {
  const [search, setSearch] = useState("");
  const [filterQual, setFilterQual] = useState("Tutti");
  const [filterOT, setFilterOT] = useState("Tutti");

  const { data: referees } = useQuery({
    queryKey: ["referees-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("referees").select("*").eq("is_active", true).order("last_name");
      if (error) throw error;
      return data;
    },
  });

  const qualifications = ["Tutti", ...new Set(referees?.map((r) => r.qualification) || [])];
  const technicalBodies = ["Tutti", ...new Set(referees?.map((r) => r.technical_body) || [])];

  const filtered = referees?.filter((r) => {
    const matchSearch = `${r.last_name} ${r.first_name}`.toLowerCase().includes(search.toLowerCase());
    const matchQual = filterQual === "Tutti" || r.qualification === filterQual;
    const matchOT = filterOT === "Tutti" || r.technical_body === filterOT;
    return matchSearch && matchQual && matchOT;
  }) || [];

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
            Organico
          </motion.h1>
          <p className="text-lg text-primary-foreground/80">La Sezione è composta da {referees?.length || 0} associati</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cerca per cognome o nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {qualifications.map((q) => (
                <Button key={q} size="sm" variant={filterQual === q ? "default" : "outline"} onClick={() => setFilterQual(q)}>{q}</Button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {technicalBodies.map((t) => (
                <Button key={t} size="sm" variant={filterOT === t ? "default" : "outline"} onClick={() => setFilterOT(t)}>{t}</Button>
              ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground mb-4">{filtered.length} risultati</div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="p-3 text-left">Cognome</th>
                  <th className="p-3 text-left">Nome</th>
                  <th className="p-3 text-center">Qualifica</th>
                  <th className="p-3 text-center">Organo Tecnico</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                    <td className="p-3 font-medium">{r.last_name}</td>
                    <td className="p-3">{r.first_name}</td>
                    <td className="p-3 text-center"><Badge variant="outline">{r.qualification}</Badge></td>
                    <td className="p-3 text-center"><Badge variant="secondary">{r.technical_body}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nessun arbitro trovato per "{search}"</p>
          )}
        </div>
      </section>
    </Layout>
  );
}
