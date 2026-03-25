import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import {
  Calendar, ClipboardList, FileText, DollarSign, Heart, Dumbbell,
  FolderOpen, Bell, LogOut, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const cards = [
  { icon: Calendar, title: "Calendario RTO", desc: "Prossime riunioni tecniche", path: "/area-associati/rto", color: "bg-primary" },
  { icon: ClipboardList, title: "Giustifica Assenza", desc: "Invia giustificazione per RTO", path: "/area-associati/giustifica", color: "bg-secondary" },
  { icon: FileText, title: "Referti Gara", desc: "Istruzioni e modelli referti", path: "/area-associati/referti", color: "bg-pitch" },
  { icon: DollarSign, title: "Rimborsi Spese", desc: "Tabelle rimborsi per categoria", path: "/area-associati/rimborsi", color: "bg-primary" },
  { icon: Heart, title: "Certificati Medici", desc: "Centri e istruzioni", path: "/area-associati/medico", color: "bg-secondary" },
  { icon: Dumbbell, title: "Area Atletica", desc: "Test, allenamenti e piani", path: "/area-associati/atletica", color: "bg-pitch" },
  { icon: FolderOpen, title: "Documenti", desc: "Modulistica e regolamenti", path: "/area-associati/documenti", color: "bg-primary" },
  { icon: Bell, title: "Comunicazioni", desc: "Avvisi interni della sezione", path: "/area-associati/comunicazioni", color: "bg-secondary" },
];

export default function MembersArea() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="container mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
            Area Associati
          </motion.h1>
          <p className="text-primary-foreground/80">Benvenuto, {user?.user_metadata?.full_name || user?.email}</p>
          <div className="flex justify-center gap-3 mt-4">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="secondary" size="sm">Pannello Admin</Button>
              </Link>
            )}
            <Button variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground" onClick={() => { signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4 mr-1" /> Esci
            </Button>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((card, i) => (
              <motion.div key={card.path} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={card.path} className="group block bg-card rounded-xl border p-5 hover:shadow-lg transition-all">
                  <div className={`${card.color} text-primary-foreground w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading font-bold text-sm mb-1">{card.title}</h3>
                  <p className="text-xs text-muted-foreground">{card.desc}</p>
                  <ChevronRight className="h-4 w-4 text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
