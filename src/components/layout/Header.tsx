import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Facebook, Instagram, Youtube, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import aiaLogo from "@/assets/aia-logo.webp";

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const navItems = [
  { label: "Home", path: "/" },
  { label: "Chi Siamo", path: "/chi-siamo" },
  {
    label: "La Sezione",
    children: [
      { label: "Organigramma", path: "/organigramma" },
      { label: "Elenco Arbitri", path: "/elenco-arbitri" },
    ],
  },
  { label: "Diventa Arbitro", path: "/diventa-arbitro" },
  { label: "Area Associati", path: "/area-associati" },
  { label: "News", path: "/news" },
  { label: "Eventi", path: "/eventi" },
  { label: "Media", path: "/media" },
  { label: "Contatti", path: "/contatti" },
];

const socials = [
  { icon: Facebook, href: "https://www.facebook.com/sezioneaialomellina", label: "Facebook" },
  { icon: XIcon, href: "https://x.com/aialomellina", label: "X" },
  { icon: Instagram, href: "https://www.instagram.com/aialomellina/", label: "Instagram" },
  { icon: Youtube, href: "https://www.youtube.com/AiaLomellina", label: "YouTube" },
  { icon: Send, href: "https://t.me/aialomellina", label: "Telegram" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 glass shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 md:h-20 px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={aiaLogo} alt="AIA Lomellina" className="h-12 w-12 object-contain" />
          <div className="hidden sm:block leading-tight">
            <span className="font-heading font-bold text-primary text-sm">AIA Lomellina</span>
            <span className="block text-[10px] text-muted-foreground">Sezione Arbitri</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-md">
                  {item.label}
                  <ChevronDown className="h-3 w-3" />
                </button>
                <div className="absolute top-full left-0 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-card rounded-lg shadow-lg border p-2 min-w-[200px]">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className="block px-4 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.path}
                to={item.path!}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === item.path
                    ? "text-primary bg-accent"
                    : "text-foreground/80 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                aria-label={s.label}
              >
                {typeof s.icon === "function" && s.icon.toString().includes("svg") ? (
                  <s.icon />
                ) : (
                  <s.icon className="h-4 w-4" />
                )}
              </a>
            ))}
          </div>
          <Link to="/diventa-arbitro">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Iscriviti al Corso
            </Button>
          </Link>
          <Link to="/area-associati">
            <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-accent">
              Area Associati
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden bg-card border-t shadow-lg">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md"
                  >
                    {item.label}
                    <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="ml-4 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 text-sm rounded-md hover:bg-accent"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path!}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="flex gap-2 pt-3">
              <Link to="/diventa-arbitro" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-primary text-primary-foreground" size="sm">Iscriviti al Corso</Button>
              </Link>
              <Link to="/area-associati" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button className="w-full" variant="outline" size="sm">Area Associati</Button>
              </Link>
            </div>
            <div className="flex justify-center gap-3 pt-3">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-primary">
                  {typeof s.icon === "function" && s.icon.toString().includes("svg") ? <s.icon /> : <s.icon className="h-5 w-5" />}
                </a>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
