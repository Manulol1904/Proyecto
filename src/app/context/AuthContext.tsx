import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = 'freshcheck_users';
const SESSION_KEY = 'freshcheck_user';

const DEFAULT_USERS: StoredUser[] = [
  { id: '1', name: 'Usuario demo', email: 'demo@freshcheck.app', password: 'demo1234' },
];

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredUser[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    localStorage.removeItem(USERS_KEY);
  }
  saveUsers(DEFAULT_USERS);
  return [...DEFAULT_USERS];
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function makeInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function toPublicUser(stored: StoredUser): User {
  return {
    id: stored.id,
    name: stored.name,
    email: stored.email,
    avatarInitials: makeInitials(stored.name),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as User;
        const users = loadUsers();
        const stillValid = users.some(
          (u) => u.id === parsed.id && u.email.toLowerCase() === parsed.email.toLowerCase()
        );
        if (stillValid) {
          setUser(parsed);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, error: 'Ingresa correo y contraseña.' };
    }

    await new Promise((r) => setTimeout(r, 600));

    const users = loadUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === trimmedEmail.toLowerCase() && u.password === trimmedPassword
    );
    if (!found) return { success: false, error: 'Correo o contraseña incorrectos.' };

    const loggedUser = toPublicUser(found);
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

    await new Promise((r) => setTimeout(r, 700));

    const users = loadUsers();
    const exists = users.find((u) => u.email.toLowerCase() === trimmedEmail.toLowerCase());
    if (exists) return { success: false, error: 'Este correo ya está registrado.' };

    const newUser: StoredUser = {
      id: String(Date.now()),
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
    };
    users.push(newUser);
    saveUsers(users);

    const loggedUser = toPublicUser(newUser);
    setUser(loggedUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(loggedUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
