import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "super_admin" | "admin" | "editor" | "member";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any; user: User | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (error) throw error;
    return data?.map((r) => r.role as AppRole) ?? [];
  }, []);

  useEffect(() => {
    let isMounted = true;
    let requestVersion = 0;

    const syncSessionState = (nextSession: Session | null) => {
      const currentVersion = ++requestVersion;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      void fetchRoles(nextSession.user.id)
        .then((nextRoles) => {
          if (!isMounted || currentVersion !== requestVersion) return;
          setRoles(nextRoles);
        })
        .catch((error) => {
          console.error("Unable to load user roles", error);
          if (!isMounted || currentVersion !== requestVersion) return;
          setRoles([]);
        })
        .finally(() => {
          if (!isMounted || currentVersion !== requestVersion) return;
          setLoading(false);
        });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!isMounted) return;
        syncSessionState(nextSession);
      }
    );

    void supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!isMounted) return;
      syncSessionState(currentSession);
    });

    return () => {
      isMounted = false;
      requestVersion += 1;
      subscription.unsubscribe();
    };
  }, [fetchRoles]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { full_name: fullName },
      },
    });
    return { error, user: data.user };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRoles([]);
    setLoading(false);
  };

  const isAdmin = roles.some((r) => ["super_admin", "admin", "editor"].includes(r));
  const isSuperAdmin = roles.includes("super_admin");

  return (
    <AuthContext.Provider value={{ session, user, roles, isAdmin, isSuperAdmin, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
