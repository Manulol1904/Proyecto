import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  usesSupabase: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = 'freshcheck_users';
const SESSION_KEY = 'freshcheck_user';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

const DEFAULT_USERS: StoredUser[] = [
  { id: '1', name: 'Usuario demo', email: 'demo@freshcheck.app', password: 'demo1234' },
];

function makeInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return 'Correo o contraseña incorrectos.';
  }
  if (lower.includes('already registered') || lower.includes('already exists')) {
    return 'Este correo ya está registrado.';
  }
  if (lower.includes('password') && lower.includes('6')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Confirma tu correo antes de iniciar sesión (revisa tu bandeja).';
  }
  return message;
}

function loadLocalUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredUser[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    localStorage.removeItem(USERS_KEY);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  return [...DEFAULT_USERS];
}

function toLocalUser(stored: StoredUser): User {
  return {
    id: stored.id,
    name: stored.name,
    email: stored.email,
    avatarInitials: makeInitials(stored.name),
  };
}

function userFromAuth(authUser: SupabaseAuthUser): User {
  const name =
    (authUser.user_metadata?.name as string | undefined) ||
    authUser.email?.split('@')[0] ||
    'Usuario';
  const email = authUser.email ?? '';

  return {
    id: authUser.id,
    name,
    email,
    avatarInitials: makeInitials(name),
  };
}

async function enrichFromProfile(base: User): Promise<User> {
  if (!supabase) return base;

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', base.id)
      .maybeSingle();

    if (error || !profile) return base;

    const name = profile.name || base.name;
    return {
      id: base.id,
      name,
      email: profile.email || base.email,
      avatarInitials: makeInitials(name),
    };
  } catch {
    return base;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const usesSupabase = isSupabaseConfigured;

  useEffect(() => {
    if (!usesSupabase || !supabase) {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as User;
          const users = loadLocalUsers();
          const stillValid = users.some(
            (u) => u.id === parsed.id && u.email.toLowerCase() === parsed.email.toLowerCase()
          );
          if (stillValid) setUser(parsed);
          else localStorage.removeItem(SESSION_KEY);
        } catch {
          localStorage.removeItem(SESSION_KEY);
        }
      }
      setIsLoading(false);
      return;
    }

    let active = true;

    const finishLoading = () => {
      if (active) setIsLoading(false);
    };

    const applySession = (authUser: SupabaseAuthUser | undefined) => {
      if (!active) return;
      if (!authUser) {
        setUser(null);
        return;
      }
      const base = userFromAuth(authUser);
      setUser(base);
      void enrichFromProfile(base).then((enriched) => {
        if (active) setUser(enriched);
      });
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session?.user);
      finishLoading();
    });

    const safetyTimer = window.setTimeout(finishLoading, 8000);

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        applySession(session?.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        window.clearTimeout(safetyTimer);
        finishLoading();
      });

    return () => {
      active = false;
      window.clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [usesSupabase]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, error: 'Ingresa correo y contraseña.' };
    }

    if (usesSupabase && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });
      if (error) return { success: false, error: mapAuthError(error.message) };
      if (data.user) {
        const base = userFromAuth(data.user);
        setUser(base);
        void enrichFromProfile(base).then(setUser);
      }
      return { success: true };
    }

    await new Promise((r) => setTimeout(r, 500));
    const users = loadLocalUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === trimmedEmail.toLowerCase() && u.password === trimmedPassword
    );
    if (!found) return { success: false, error: 'Correo o contraseña incorrectos.' };

    const loggedUser = toLocalUser(found);
    setUser(loggedUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(loggedUser));
    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName) return { success: false, error: 'Ingresa tu nombre.' };
    if (!trimmedEmail) return { success: false, error: 'Ingresa tu correo.' };
    if (trimmedPassword.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    if (usesSupabase && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
        options: { data: { name: trimmedName } },
      });
      if (error) return { success: false, error: mapAuthError(error.message) };
      if (data.user) {
        const base = userFromAuth(data.user);
        setUser(base);
        void enrichFromProfile(base).then(setUser);
      }
      return { success: true };
    }

    await new Promise((r) => setTimeout(r, 600));
    const users = loadLocalUsers();
    const exists = users.find((u) => u.email.toLowerCase() === trimmedEmail.toLowerCase());
    if (exists) return { success: false, error: 'Este correo ya está registrado.' };

    const newUser: StoredUser = {
      id: String(Date.now()),
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const loggedUser = toLocalUser(newUser);
    setUser(loggedUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(loggedUser));
    return { success: true };
  };

  const logout = async () => {
    if (usesSupabase && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, usesSupabase, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
