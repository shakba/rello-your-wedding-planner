import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AppRole } from "@/types/wedding";

type UserRole = AppRole | "couple" | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: UserRole;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: unknown }>;
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const resolveRole = async (userId: string): Promise<UserRole> => {
  try {
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);

    if (error) {
      console.error("resolveRole error:", error);
      return "couple";
    }

    if (data?.some((row) => row.role === "admin")) {
      return "admin";
    }

    return "couple";
  } catch (error) {
    console.error("resolveRole unexpected error:", error);
    return "couple";
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    let currentUserId: string | null = null;

    const applySession = (nextSession: Session | null) => {
      if (!mounted) return;

      const nextUserId = nextSession?.user?.id ?? null;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setAuthReady(true);

      // Only trigger role re-fetch (loading=true) if user actually changed
      if (nextUserId !== currentUserId) {
        currentUserId = nextUserId;
        if (nextUserId) {
          setLoading(true);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
    });

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        applySession(data.session);
      })
      .catch((error) => {
        console.error("getSession error:", error);
        setAuthReady(true);
        setLoading(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    void resolveRole(user.id)
      .then((nextRole) => {
        if (!cancelled) {
          setRole(nextRole);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, user?.id]);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin,
        },
      });
      return { error };
    } catch (error) {
      console.error("signUp error:", error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (!error) {
        setSession(data.session);
        setUser(data.user);
      }

      return { error };
    } catch (error) {
      console.error("signIn error:", error);
      setLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("signOut error:", error);
    } finally {
      setSession(null);
      setUser(null);
      setRole(null);
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({ session, user, role, loading, signUp, signIn, signOut }),
    [session, user, role, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
