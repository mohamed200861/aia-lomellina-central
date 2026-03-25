import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Newspaper, Calendar, Image, Users, Settings,
  FileText, MessageSquare, ClipboardList, DollarSign, BookOpen,
  Shield, Menu, X, LogOut, ChevronDown, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import aiaLogo from "@/assets/aia-logo.webp";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/news", label: "News", icon: Newspaper },
  { path: "/admin/events", label: "Eventi", icon: Calendar },
  { path: "/admin/media", label: "Media", icon: Image },
  { path: "/admin/staff", label: "Staff", icon: Users },
  { path: "/admin/registrations", label: "Iscrizioni Corso", icon: BookOpen },
  { path: "/admin/submissions", label: "Messaggi", icon: MessageSquare },
  { path: "/admin/rto", label: "RTO", icon: ClipboardList },
  { path: "/admin/reimbursements", label: "Rimborsi", icon: DollarSign },
  { path: "/admin/reports", label: "Referti", icon: FileText },
  { path: "/admin/users", label: "Utenti & Ruoli", icon: Shield },
  { path: "/admin/settings", label: "Impostazioni", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary text-primary-foreground transform transition-transform duration-200 lg:translate-x-0 lg:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 p-4 border-b border-primary-foreground/20">
          <img src={aiaLogo} alt="AIA" className="h-10 w-10 object-contain" />
          <div>
            <h2 className="font-heading font-bold text-sm">AIA Lomellina</h2>
            <p className="text-xs text-primary-foreground/60">Pannello Admin</p>
          </div>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? "bg-secondary text-secondary-foreground font-semibold" : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"}`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-primary-foreground/20">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
            <Home className="h-4 w-4" /> Torna al Sito
          </Link>
          <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors w-full">
            <LogOut className="h-4 w-4" /> Esci
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-background border-b px-4 py-3 flex items-center gap-4 sticky top-0 z-30">
          <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <span className="text-sm text-muted-foreground">{user?.email}</span>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
