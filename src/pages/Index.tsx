import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, Calendar, Newspaper, BookOpen, Award, PhoneCall,
  ChevronRight, TrendingUp, Play, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import heroImage from "@/assets/hero-referee.jpg";
import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

function AnimatedCounter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = Date.now();
          const tick = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <div ref={ref}>{count}{suffix}</div>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function Index() {
  const { data: settings } = useSiteSettings();
  const { data: latestNews = [] } = useQuery({
    queryKey: ["public-news", "home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("id, title, published_at, category")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ["public-events", "home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, event_date, event_time, location")
        .eq("is_published", true)
        .order("event_date", { ascending: true })
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Arbitro in azione" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1.5 bg-secondary/90 text-secondary-foreground rounded-full text-sm font-semibold mb-6">
              Sezione AIA Lomellina
            </span>
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-primary-foreground leading-tight mb-6">
              {settings?.hero_title || "Il Calcio ha bisogno di te."}{" "}
              <span className="text-secondary">Diventa Arbitro.</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg">
              {settings?.hero_subtitle || "Entra a far parte della famiglia arbitrale. Formazione, crescita personale e passione per lo sport più amato d'Italia."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/diventa-arbitro">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-base px-8">
                  Iscriviti al Corso <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/chi-siamo">
                <Button size="lg" variant="outline" className="border-2 border-white text-white bg-white/10 hover:bg-white/20 font-bold text-base px-8">
                  Scopri di più
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="section-padding bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">Accesso Rapido</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Tutto ciò di cui hai bisogno a portata di clic</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "Diventa Arbitro", desc: "Iscriviti al prossimo corso arbitri", path: "/diventa-arbitro", color: "bg-primary" },
              { icon: Users, title: "Organigramma", desc: "Scopri chi guida la sezione", path: "/organigramma", color: "bg-pitch" },
              { icon: Newspaper, title: "News", desc: "Ultime notizie e comunicati", path: "/news", color: "bg-secondary" },
              { icon: Calendar, title: "Eventi", desc: "Calendario attività e riunioni", path: "/eventi", color: "bg-primary" },
              { icon: Award, title: "Area Associati", desc: "Servizi riservati agli associati", path: "/area-associati", color: "bg-pitch" },
              { icon: PhoneCall, title: "Contatti", desc: "Scrivici o vieni a trovarci", path: "/contatti", color: "bg-secondary" },
            ].map((card, i) => (
              <motion.div
                key={card.path}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Link
                  to={card.path}
                  className="group block bg-card rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 p-6"
                >
                  <div className={`${card.color} text-primary-foreground w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-1">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.desc}</p>
                  <ChevronRight className="h-5 w-5 text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 81, suffix: "+", label: "Arbitri Attivi" },
              { value: 25, suffix: "+", label: "Anni di Tradizione Arbitrale" },
              { value: 1200, suffix: "+", label: "Gare Arbitrate / Anno" },
              { value: 30, suffix: "+", label: "Nuovi Arbitri / Anno" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="text-4xl md:text-5xl font-heading font-extrabold text-secondary mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-primary-foreground/70">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Become Referee */}
      <section className="section-padding bg-muted">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-semibold mb-4">
                CORSO ARBITRI
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                Perché diventare <span className="text-primary">Arbitro?</span>
              </h2>
              <ul className="space-y-4 mb-8">
                {[
                  "Formazione gratuita e supporto costante",
                  "Crescita personale e capacità decisionale",
                  "Appartenenza a una grande famiglia sportiva",
                  "Possibilità di carriera fino alla Serie A",
                  "Rimborsi spese per ogni gara arbitrata",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/diventa-arbitro">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                  Inizia il Percorso <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-8 border shadow-lg"
            >
              <h3 className="font-heading font-bold text-xl mb-4">Requisiti</h3>
              <div className="space-y-3 text-sm text-foreground/80">
                <p>• Età compresa tra 14 e 40 anni</p>
                <p>• Cittadinanza italiana o permesso di soggiorno</p>
                <p>• Idoneità fisica certificata</p>
                <p>• Passione per il calcio e senso di giustizia</p>
              </div>
              <div className="mt-6 p-4 bg-accent rounded-lg">
                <p className="text-sm font-medium text-accent-foreground">📅 Prossimo corso: <strong>{settings?.next_course_date || "Settembre 2026"}</strong></p>
                <p className="text-xs text-muted-foreground mt-1">Le iscrizioni sono aperte tutto l'anno</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* News Preview */}
      <section className="section-padding bg-background">
        <div className="container mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold">Ultime News</h2>
              <p className="text-muted-foreground mt-1">Comunicati e aggiornamenti dalla sezione</p>
            </div>
            <Link to="/news" className="hidden sm:flex items-center gap-1 text-primary font-medium text-sm hover:underline">
              Tutte le news <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {latestNews.map((news, i) => (
              <motion.div
                key={news.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
                    <Newspaper className="h-12 w-12 text-primary/40" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium bg-accent text-accent-foreground px-2 py-0.5 rounded-full">{news.category || "Generale"}</span>
                      <span className="text-xs text-muted-foreground">{news.published_at ? new Date(news.published_at).toLocaleDateString("it-IT") : ""}</span>
                    </div>
                    <h3 className="font-heading font-bold text-base group-hover:text-primary transition-colors">{news.title}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {latestNews.length === 0 && <p className="text-center text-muted-foreground mt-6">Le news pubblicate appariranno qui automaticamente.</p>}
          <div className="text-center mt-6 sm:hidden">
            <Link to="/news">
              <Button variant="outline">Tutte le News</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Events Preview */}
      <section className="section-padding bg-muted">
        <div className="container mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold">Prossimi Eventi</h2>
              <p className="text-muted-foreground mt-1">Non perdere le attività della sezione</p>
            </div>
            <Link to="/eventi" className="hidden sm:flex items-center gap-1 text-primary font-medium text-sm hover:underline">
              Calendario <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingEvents.map((event, i) => (
              <motion.div
                key={event.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex bg-card rounded-xl border p-5 gap-4 hover:shadow-md transition-shadow"
              >
                <div className="bg-primary text-primary-foreground rounded-lg p-3 text-center min-w-[65px] h-fit">
                  <div className="text-2xl font-bold font-heading">{new Date(event.event_date).getDate()}</div>
                  <div className="text-xs uppercase">{new Date(event.event_date).toLocaleString("it-IT", { month: "short" })}</div>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">🕐 {event.time} — 📍 {event.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {upcomingEvents.length === 0 && <p className="text-center text-muted-foreground mt-6">Gli eventi pubblicati appariranno qui automaticamente.</p>}
        </div>
      </section>

      {/* Media */}
      <section className="section-padding bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-heading font-bold">Media</h2>
            <p className="text-muted-foreground mt-1">Foto e video dalla nostra sezione</p>
          </div>
          <div className="aspect-video max-w-3xl mx-auto rounded-2xl overflow-hidden border shadow-lg bg-primary/5 flex items-center justify-center">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed?listType=user_uploads&list=AiaLomellina"
              title="AIA Lomellina YouTube"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="w-full h-full"
            />
          </div>
          <div className="text-center mt-6">
            <Link to="/media">
              <Button variant="outline">Galleria Completa <ChevronRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Feed */}
      <section className="section-padding bg-muted">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-heading font-bold">Seguici sui Social</h2>
            <p className="text-muted-foreground mt-1">Resta connesso con la sezione</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card rounded-xl border p-6 text-center">
              <div className="text-3xl mb-3">📸</div>
              <h3 className="font-heading font-bold text-lg mb-2">Instagram</h3>
              <p className="text-sm text-muted-foreground mb-4">Segui @aialomellina per foto e storie dal campo</p>
              <a href="https://www.instagram.com/aialomellina/" target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-[hsl(280,60%,50%)] to-[hsl(340,70%,55%)] text-primary-foreground border-0 hover:opacity-90">
                  Seguici su Instagram
                </Button>
              </a>
            </div>
            <div className="bg-card rounded-xl border p-6 text-center">
              <div className="text-3xl mb-3">✈️</div>
              <h3 className="font-heading font-bold text-lg mb-2">Telegram</h3>
              <p className="text-sm text-muted-foreground mb-4">Unisciti al nostro canale per aggiornamenti in tempo reale</p>
              <a href="https://t.me/aialomellina" target="_blank" rel="noopener noreferrer">
                <Button className="bg-[hsl(200,80%,50%)] text-primary-foreground border-0 hover:opacity-90">
                  Unisciti al Canale
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
