import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Search, Newspaper } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function News() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("Tutti");

  const { data: news } = useQuery({
    queryKey: ["public-news"],
    queryFn: async () => {
      const { data, error } = await supabase.from("news").select("*").eq("is_published", true).order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const categories = ["Tutti", ...new Set(news?.map((n) => n.category).filter(Boolean) || [])];

  const filtered = (news || []).filter((n) => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCat === "Tutti" || n.category === activeCat;
    return matchSearch && matchCat;
  });

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-heading font-extrabold mb-4">News</motion.h1>
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
                <Button key={cat} size="sm" variant={activeCat === cat ? "default" : "outline"} onClick={() => setActiveCat(cat)}>{cat}</Button>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            {filtered.map((n, i) => (
              <motion.article key={n.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  {n.category && <span className="text-xs font-medium bg-accent text-accent-foreground px-2 py-0.5 rounded-full">{n.category}</span>}
                  <span className="text-xs text-muted-foreground">{n.published_at ? new Date(n.published_at).toLocaleDateString("it-IT") : ""}</span>
                  {n.is_featured && <span className="text-xs font-bold text-secondary">★ In evidenza</span>}
                </div>
                <h2 className="font-heading font-bold text-lg mb-2">{n.title}</h2>
                {n.excerpt && <p className="text-sm text-muted-foreground">{n.excerpt}</p>}
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
