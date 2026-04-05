import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Newspaper, ExternalLink, Calendar, ChevronRight, X, ZoomIn } from "lucide-react";

export default function PressReview() {
  const { data: articles } = useQuery({
    queryKey: ["press-review"],
    queryFn: async () => {
      const { data, error } = await supabase.from("press_review").select("*").order("article_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const years = [...new Set(articles?.map((a: any) => a.year) || [])].sort((a, b) => b - a);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<{ url: string; title: string } | null>(null);
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (years.length > 0 && activeYear === null) setActiveYear(years[0]);
  }, [years, activeYear]);

  const scrollToYear = (year: number) => {
    setActiveYear(year);
    sectionRefs.current[year]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
            Rassegna Stampa
          </motion.h1>
          <p className="text-lg text-primary-foreground/80">La sezione AIA Lomellina sui giornali e media locali</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          {/* Year navigation */}
          {years.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10 justify-center sticky top-16 z-20 bg-background/95 backdrop-blur-sm py-3 -mt-3 rounded-xl">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => scrollToYear(year)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                    activeYear === year
                      ? "bg-primary text-primary-foreground shadow-lg scale-105"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          {/* Year sections */}
          {years.map((year) => {
            const yearArticles = articles?.filter((a: any) => a.year === year) || [];
            return (
              <div key={year} ref={(el) => { sectionRefs.current[year] = el; }} className="mb-14 scroll-mt-28">
                {/* Year header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-primary text-primary-foreground rounded-2xl px-6 py-3 font-heading font-extrabold text-2xl shadow-md">
                    {year}
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-sm text-muted-foreground font-medium">{yearArticles.length} articol{yearArticles.length === 1 ? "o" : "i"}</span>
                </div>

                {/* Timeline */}
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden md:block" />
                  <div className="space-y-4">
                    {yearArticles.map((a: any, i: number) => {
                      const thumbUrl = a.thumbnail_url || a.file_url;
                      const hasImage = !!thumbUrl;
                      return (
                        <motion.div
                          key={a.id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.04 }}
                          className="md:pl-14 relative"
                        >
                          {/* Timeline dot */}
                          <div className="absolute left-[18px] top-5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background shadow hidden md:block" />

                          <div className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all group">
                            <div className="flex flex-col sm:flex-row">
                              {/* Thumbnail - clickable for lightbox */}
                              {hasImage ? (
                                <div
                                  className="sm:w-48 h-40 sm:h-auto shrink-0 relative cursor-pointer overflow-hidden"
                                  onClick={() => setLightbox({ url: thumbUrl, title: a.newspaper })}
                                >
                                  <img src={thumbUrl} alt={a.newspaper} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                  </div>
                                </div>
                              ) : (
                                <div className="sm:w-48 h-40 sm:h-auto shrink-0 bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center">
                                  <Newspaper className="h-10 w-10 text-primary/30" />
                                </div>
                              )}

                              {/* Content */}
                              <div className="flex-1 p-5 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                                  <span className="text-sm font-medium text-primary">
                                    {new Date(a.article_date).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
                                  </span>
                                </div>
                                <h3 className="font-heading font-bold text-lg mb-1">{a.newspaper}</h3>
                                {a.page && <p className="text-sm text-muted-foreground mb-1">{a.page}</p>}
                                {a.description && <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>}

                                <div className="flex items-center gap-3 mt-3">
                                  {a.external_url && (
                                    <a
                                      href={a.external_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
                                    >
                                      Leggi l'articolo <ChevronRight className="h-3.5 w-3.5" />
                                    </a>
                                  )}
                                  {a.file_url && a.file_url !== a.thumbnail_url && (
                                    <a
                                      href={a.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-primary hover:underline"
                                    >
                                      PDF <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {(!articles || articles.length === 0) && (
            <div className="text-center py-16">
              <Newspaper className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Nessun articolo disponibile</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              onClick={() => setLightbox(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightbox.url}
                alt={lightbox.title}
                className="w-full max-h-[85vh] object-contain rounded-lg"
              />
              <p className="text-white text-center mt-3 text-sm font-medium">{lightbox.title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
