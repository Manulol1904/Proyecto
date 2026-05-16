import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock user database (in a real app, this would be a backend)
const MOCK_USERS: Array<{ id: string; name: string; email: string; password: string }> = [
  { id: '1', name: 'Demo User', email: 'demo@freshcheck.app', password: 'demo1234' },
];

const SESSION_KEY = 'freshcheck_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const makeInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    const found = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return { success: false, error: 'Correo o contraseña incorrectos.' };

    const loggedUser: User = {
      id: found.id,
      name: found.name,
      email: found.email,
      avatarInitials: makeInitials(found.name),
    };
    setUser(loggedUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(loggedUser));
    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 900));
    const exists = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return { success: false, error: 'Este correo ya está registrado.' };
    if (password.length < 6) return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };

    const newUser = { id: String(Date.now()), name, email, password };
    MOCK_USERS.push(newUser);

    const loggedUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatarInitials: makeInitials(newUser.name),
    };
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
