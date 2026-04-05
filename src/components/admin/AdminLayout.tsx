import { ReactNode, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Newspaper, Calendar, Image, Users, Settings,
  FileText, MessageSquare, ClipboardList, DollarSign, BookOpen,
  Shield, Menu, X, LogOut, Home, UserCheck, BookMarked, Heart,
  Dumbbell, FolderOpen, Bell, Archive, Activity, Stethoscope,
  ChevronDown, ChevronRight, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import aiaLogo from "@/assets/aia-logo.webp";

interface NavItem {
  path: string;
  label: string;
  icon: any;
  requireSuperAdmin?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const allNavGroups: NavGroup[] = [
  {
    label: "Generale",
    items: [
      { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { path: "/admin/settings", label: "Impostazioni", icon: Settings },
      { path: "/admin/activity-log", label: "Log Attività", icon: Activity },
    ],
  },
  {
    label: "Contenuti",
    items: [
      { path: "/admin/news", label: "News", icon: Newspaper },
      { path: "/admin/events", label: "Eventi", icon: Calendar },
      { path: "/admin/media", label: "Media", icon: Image },
      { path: "/admin/press-review", label: "Rassegna Stampa", icon: BookMarked },
      { path: "/admin/social-feed", label: "Social Feed", icon: Heart },
    ],
  },
  {
    label: "Organizzazione",
    items: [
      { path: "/admin/staff", label: "Staff", icon: Users },
      { path: "/admin/referees", label: "Organico Arbitri", icon: UserCheck },
    ],
  },
  {
    label: "Inbox & Iscrizioni",
    items: [
      { path: "/admin/registrations", label: "Iscrizioni Corso", icon: BookOpen },
      { path: "/admin/submissions", label: "Messaggi", icon: MessageSquare },
      { path: "/admin/justifications", label: "Giustificazioni", icon: Archive },
    ],
  },
  {
    label: "Area Associati",
    items: [
      { path: "/admin/rto", label: "RTO", icon: ClipboardList },
      { path: "/admin/reimbursements", label: "Rimborsi", icon: DollarSign },
      { path: "/admin/reports", label: "Referti", icon: FileText },
      { path: "/admin/medical", label: "Centri Medici", icon: Stethoscope },
      { path: "/admin/athletic", label: "Area Atletica", icon: Dumbbell },
      { path: "/admin/documents", label: "Documenti", icon: FolderOpen },
      { path: "/admin/communications", label: "Comunicazioni", icon: Bell },
    ],
  },
  {
    label: "Sistema",
    items: [
      { path: "/admin/users", label: "Utenti & Ruoli", icon: Shield, requireSuperAdmin: true },
      { path: "/admin/email-settings", label: "Email Settings", icon: Mail, requireSuperAdmin: true },
    ],
  },
];

const ROLE_DISPLAY: Record<string, string> = {
  super_admin: "Il Grande P",
  admin: "Admin",
  editor: "Editor",
  member: "Membro",
};

// Editor can only access these paths
const EDITOR_ALLOWED = new Set([
  "/admin",
  "/admin/news",
  "/admin/events",
  "/admin/media",
  "/admin/press-review",
  "/admin/social-feed",
  "/admin/staff",
  "/admin/referees",
]);

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const { signOut, user, roles, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const primaryRole = roles[0] || "member";
  const isEditor = primaryRole === "editor";

  // Filter nav groups based on role
  const visibleGroups = useMemo(() => {
    return allNavGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (item.requireSuperAdmin && !isSuperAdmin) return false;
          if (isEditor && !EDITOR_ALLOWED.has(item.path)) return false;
          return true;
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [isSuperAdmin, isEditor]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const displayRole = roles.length > 0 ? ROLE_DISPLAY[roles[0]] || roles[0] : "";

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary text-primary-foreground transform transition-transform duration-200 lg:translate-x-0 lg:static flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-primary-foreground/20 shrink-0">
          <img src={aiaLogo} alt="AIA" className="h-10 w-10 object-contain" />
          <div>
            <h2 className="font-heading font-bold text-sm">AIA Lomellina</h2>
            <p className="text-xs text-primary-foreground/60">Pannello Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {visibleGroups.map((group) => {
            const isCollapsed = collapsedGroups[group.label];
            return (
              <div key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground/50 hover:text-primary-foreground/70 transition-colors"
                >
                  {group.label}
                  {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
                {!isCollapsed && (
                  <div className="mt-1 space-y-0.5">
                    {group.items.map((item) => {
                      const active = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                            active
                              ? "bg-secondary text-secondary-foreground font-semibold shadow-sm"
                              : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                          }`}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-primary-foreground/20 shrink-0 space-y-1">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors rounded-lg hover:bg-primary-foreground/5">
            <Home className="h-4 w-4" /> Torna al Sito
          </Link>
          <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors w-full rounded-lg hover:bg-primary-foreground/5">
            <LogOut className="h-4 w-4" /> Esci
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-background border-b px-4 py-3 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="text-right">
            <span className="text-sm text-muted-foreground block">{user?.email}</span>
            {displayRole && (
              <span className={`text-xs font-bold ${roles[0] === "super_admin" ? "text-secondary" : "text-primary"}`}>
                {displayRole}
              </span>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
