import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Newspaper, ExternalLink, Calendar } from "lucide-react";

export default function PressReview() {
  const { data: articles } = useQuery({
    queryKey: ["press-review"],
    queryFn: async () => {
      const { data, error } = await supabase.from("press_review").select("*").order("article_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const years = [...new Set(articles?.map((a) => a.year) || [])].sort((a, b) => b - a);

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
            Rassegna Stampa
          </motion.h1>
          <p className="text-lg text-primary-foreground/80">La sezione sui giornali e media locali</p>
        </div>
      </section>
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-4xl">
          {years.map((year) => {
            const yearArticles = articles?.filter((a) => a.year === year) || [];
            return (
              <div key={year} className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-heading font-bold text-xl">{year}</div>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="space-y-3">
                  {yearArticles.map((a, i) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 bg-card border rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <Calendar className="h-5 w-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{new Date(a.article_date).toLocaleDateString("it-IT")}</span>
                        <span className="mx-2 text-muted-foreground">—</span>
                        <span className="text-sm font-bold">{a.newspaper}</span>
                        {a.page && <span className="text-sm text-muted-foreground ml-2">• {a.page}</span>}
                      </div>
                      {a.external_url && (
                        <a href={a.external_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
          {(!articles || articles.length === 0) && (
            <div className="text-center py-12">
              <Newspaper className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Nessun articolo disponibile</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
