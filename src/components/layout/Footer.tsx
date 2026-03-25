import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, Send, MessageCircle } from "lucide-react";
import aiaLogo from "@/assets/aia-logo.png";

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={aiaLogo} alt="AIA Lomellina" className="h-14 w-14 object-contain" />
              <div>
                <span className="font-heading font-bold text-lg block">AIA Lomellina</span>
                <span className="text-primary-foreground/70 text-xs">Sezione Arbitri di Calcio</span>
              </div>
            </Link>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Associazione Italiana Arbitri — Sezione di Lomellina. Formazione, passione e fair play dal cuore della Lombardia.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-secondary">Link Rapidi</h3>
            <ul className="space-y-2 text-sm">
              {[
                { l: "Chi Siamo", p: "/chi-siamo" },
                { l: "Organigramma", p: "/organigramma" },
                { l: "Diventa Arbitro", p: "/diventa-arbitro" },
                { l: "News", p: "/news" },
                { l: "Eventi", p: "/eventi" },
                { l: "Media", p: "/media" },
                { l: "Contatti", p: "/contatti" },
              ].map((x) => (
                <li key={x.p}>
                  <Link to={x.p} className="text-primary-foreground/70 hover:text-secondary transition-colors">
                    {x.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-secondary">Contatti</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-secondary shrink-0" />
                <span className="text-primary-foreground/70">Via Don A. Ceriotti 19, 27029 Vigevano (PV), Italy</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-secondary shrink-0" />
                <div className="text-primary-foreground/70">
                  <a href="tel:+390381327014" className="hover:text-secondary transition-colors block">+39 0381 327014</a>
                  <a href="tel:+393737832227" className="hover:text-secondary transition-colors block">+39 373 7832227</a>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary shrink-0" />
                <a href="mailto:lomellina@aia-figc.it" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                  lomellina@aia-figc.it
                </a>
              </li>
            </ul>
          </div>

          {/* Social + WhatsApp */}
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-secondary">Seguici</h3>
            <div className="flex gap-3 mb-6">
              {[
                { icon: Facebook, href: "https://www.facebook.com/sezioneaialomellina" },
                { icon: XIcon, href: "https://x.com/aialomellina" },
                { icon: Instagram, href: "https://www.instagram.com/aialomellina/" },
                { icon: Youtube, href: "https://www.youtube.com/AiaLomellina" },
                { icon: Send, href: "https://t.me/aialomellina" },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-primary-foreground/10 rounded-lg hover:bg-secondary hover:text-secondary-foreground transition-colors"
                >
                  {typeof s.icon === "function" && s.icon.toString().includes("svg") ? <s.icon /> : <s.icon className="h-5 w-5" />}
                </a>
              ))}
            </div>
            <a
              href="https://wa.me/393737832227"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-pitch text-pitch-foreground rounded-lg font-medium text-sm hover:bg-pitch/90 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Scrivici su WhatsApp
            </a>
          </div>
        </div>

        {/* Map */}
        <div className="mt-12 rounded-xl overflow-hidden border border-primary-foreground/10">
          <iframe
            title="AIA Lomellina sede"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2806.8!2d8.859!3d45.317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786c1c1c1c1c1c1%3A0x0!2sVia+Don+A.+Ceriotti+19%2C+27029+Vigevano+PV!5e0!3m2!1sit!2sit!4v1700000000000"
            width="100%"
            height="250"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center text-xs text-primary-foreground/50">
          <span>© {new Date().getFullYear()} AIA Sezione di Lomellina. Tutti i diritti riservati.</span>
          <span>Associazione Italiana Arbitri — FIGC</span>
        </div>
      </div>
    </footer>
  );
}
