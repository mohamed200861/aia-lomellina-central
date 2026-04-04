import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Play, Image as ImageIcon, Music, ExternalLink, X } from "lucide-react";

function getYoutubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m?.[1] || null;
}

export default function MediaPage() {
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const { data: media } = useQuery({
    queryKey: ["public-media"],
    queryFn: async () => {
      const { data, error } = await supabase.from("media").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const photos = media?.filter((m) => m.media_type === "image") || [];
  const videos = media?.filter((m) => m.media_type === "video") || [];
  const youtubeItems = media?.filter((m) => m.media_type === "youtube") || [];
  const audioItems = media?.filter((m) => m.media_type === "audio") || [];

  const sections = [
    { key: "all", label: "Tutti" },
    { key: "image", label: `Foto (${photos.length})` },
    { key: "video", label: `Video (${videos.length})` },
    { key: "youtube", label: `YouTube (${youtubeItems.length})` },
    { key: "audio", label: `Audio (${audioItems.length})` },
  ];

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
            Media
          </motion.h1>
          <p className="text-lg text-primary-foreground/80">Galleria foto, video e audio dalla nostra sezione</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-6xl">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {sections.map((s) => (
              <button
                key={s.key}
                onClick={() => setFilter(s.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === s.key ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-accent"}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Photos / Videos Grid */}
          {(filter === "all" || filter === "image" || filter === "video") && (photos.length > 0 || videos.length > 0) && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <ImageIcon className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-heading font-bold">Foto & Video</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...(filter !== "video" ? photos : []), ...(filter !== "image" ? videos : [])].map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    className="group relative aspect-square rounded-xl overflow-hidden border cursor-pointer"
                    onClick={() => m.media_type === "image" && setLightbox(m.file_url)}
                  >
                    {m.media_type === "image" ? (
                      <img src={m.file_url} alt={m.title || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <video src={m.file_url} className="w-full h-full object-cover" controls preload="metadata" />
                    )}
                    {m.title && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <p className="text-white text-sm font-medium truncate">{m.title}</p>
                      </div>
                    )}
                    {m.media_type === "video" && (
                      <div className="absolute top-2 left-2 bg-black/50 text-white p-1.5 rounded-full">
                        <Play className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* YouTube Section */}
          {(filter === "all" || filter === "youtube") && youtubeItems.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Play className="h-6 w-6 text-red-600" />
                <h2 className="text-2xl font-heading font-bold">YouTube</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {youtubeItems.map((m) => {
                  const ytId = getYoutubeId(m.file_url);
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card rounded-xl border overflow-hidden">
                      {ytId ? (
                        <div className="aspect-video">
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                            title={m.title || "YouTube Video"}
                          />
                        </div>
                      ) : (
                        <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="aspect-video bg-muted flex items-center justify-center">
                          <ExternalLink className="h-8 w-8 text-muted-foreground" />
                        </a>
                      )}
                      {(m.title || m.description) && (
                        <div className="p-4">
                          {m.title && <h3 className="font-heading font-bold text-sm">{m.title}</h3>}
                          {m.description && <p className="text-xs text-muted-foreground mt-1">{m.description}</p>}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Audio Section */}
          {(filter === "all" || filter === "audio") && audioItems.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Music className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-heading font-bold">Audio</h2>
              </div>
              <div className="space-y-4">
                {audioItems.map((m) => (
                  <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    className="bg-card rounded-xl border p-4 flex items-center gap-4">
                    <div className="bg-primary/10 rounded-full p-3 shrink-0">
                      <Music className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{m.title || "Audio"}</h3>
                      {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}
                      <audio src={m.file_url} controls className="mt-2 w-full h-8" preload="metadata" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {(!media || media.length === 0) && (
            <div className="text-center py-16">
              <ImageIcon className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground">Nessun contenuto media disponibile</p>
            </div>
          )}

          {/* Channel link */}
          <div className="text-center mt-8">
            <a href="https://www.youtube.com/AiaLomellina" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline text-sm inline-flex items-center gap-1">
              Visita il nostro canale YouTube <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white p-2" onClick={() => setLightbox(null)}><X className="h-6 w-6" /></button>
          <img src={lightbox} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </Layout>
  );
}
