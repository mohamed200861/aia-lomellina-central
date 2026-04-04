import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Search, Newspaper, Calendar, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function News() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("Tutti");
  const [selectedNews, setSelectedNews] = useState<any>(null);

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

  if (selectedNews) {
    return (
      <Layout>
        <section className="bg-primary text-primary-foreground section-padding">
          <div className="container mx-auto">
            <Button variant="ghost" className="text-primary-foreground/70 hover:text-primary-foreground mb-4" onClick={() => setSelectedNews(null)}>
              ← Torna alle News
            </Button>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-heading font-extrabold">
              {selectedNews.title}
            </motion.h1>
            <div className="flex items-center gap-3 mt-3 text-primary-foreground/70 text-sm">
              {selectedNews.category && <span className="bg-secondary/20 text-secondary px-2 py-0.5 rounded-full text-xs font-medium">{selectedNews.category}</span>}
              {selectedNews.published_at && <span>{new Date(selectedNews.published_at).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}</span>}
            </div>
          </div>
        </section>
        <section className="section-padding bg-background">
          <div className="container mx-auto max-w-3xl">
            {selectedNews.featured_image && (
              <img src={selectedNews.featured_image} alt={selectedNews.title} className="w-full h-64 md:h-96 object-cover rounded-2xl mb-8 shadow-lg" />
            )}
            {selectedNews.excerpt && <p className="text-lg text-muted-foreground mb-6 italic border-l-4 border-primary pl-4">{selectedNews.excerpt}</p>}
            {selectedNews.content && (
              <div className="prose prose-lg max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: selectedNews.content.replace(/\n/g, "<br/>") }} />
            )}
          </div>
        </section>
      </Layout>
    );
  }

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

          {/* Featured news */}
          {activeCat === "Tutti" && !search && filtered.find((n) => n.is_featured) && (() => {
            const featured = filtered.find((n) => n.is_featured)!;
            return (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border overflow-hidden mb-8 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setSelectedNews(featured)}
              >
                <div className="grid md:grid-cols-2">
                  {featured.featured_image ? (
                    <img src={featured.featured_image} alt={featured.title} className="w-full h-64 md:h-full object-cover" />
                  ) : (
                    <div className="h-64 bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
                      <Newspaper className="h-16 w-16 text-primary/30" />
                    </div>
                  )}
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="h-4 w-4 text-secondary fill-secondary" />
                      <span className="text-xs font-bold text-secondary uppercase">In Evidenza</span>
                    </div>
                    <h2 className="font-heading font-bold text-2xl mb-3 group-hover:text-primary transition-colors">{featured.title}</h2>
                    {featured.excerpt && <p className="text-muted-foreground mb-4">{featured.excerpt}</p>}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {featured.published_at && new Date(featured.published_at).toLocaleDateString("it-IT")}
                      {featured.category && <span className="bg-accent px-2 py-0.5 rounded-full ml-2">{featured.category}</span>}
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })()}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.filter((n) => activeCat !== "Tutti" || search || !n.is_featured).map((n, i) => (
              <motion.article
                key={n.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setSelectedNews(n)}
              >
                {n.featured_image ? (
                  <img src={n.featured_image} alt={n.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center">
                    <Newspaper className="h-12 w-12 text-primary/30" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {n.category && <span className="text-xs font-medium bg-accent text-accent-foreground px-2 py-0.5 rounded-full">{n.category}</span>}
                    <span className="text-xs text-muted-foreground">{n.published_at ? new Date(n.published_at).toLocaleDateString("it-IT") : ""}</span>
                  </div>
                  <h3 className="font-heading font-bold text-base group-hover:text-primary transition-colors line-clamp-2">{n.title}</h3>
                  {n.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{n.excerpt}</p>}
                </div>
              </motion.article>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Newspaper className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Nessuna news trovata</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
