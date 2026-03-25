import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Play, Image as ImageIcon } from "lucide-react";

export default function MediaPage() {
  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
            Media
          </motion.h1>
          <p className="text-lg text-primary-foreground/80">Galleria foto e video dalla nostra sezione</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          {/* Video */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Play className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-heading font-bold">Video</h2>
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden border shadow-lg">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed?listType=user_uploads&list=AiaLomellina"
                title="AIA Lomellina YouTube"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <p className="text-center mt-4">
              <a
                href="https://www.youtube.com/AiaLomellina"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium text-sm hover:underline"
              >
                Visita il nostro canale YouTube →
              </a>
            </p>
          </div>

          {/* Gallery */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <ImageIcon className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-heading font-bold">Galleria Fotografica</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="aspect-square bg-gradient-to-br from-primary/10 to-accent rounded-xl border flex items-center justify-center"
                >
                  <ImageIcon className="h-10 w-10 text-primary/30" />
                </motion.div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Segui il nostro{" "}
              <a href="https://www.instagram.com/aialomellina/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Instagram
              </a>{" "}
              per vedere tutte le foto più recenti.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
