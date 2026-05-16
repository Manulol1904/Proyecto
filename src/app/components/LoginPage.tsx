import { useState, FormEvent } from 'react';
import { Eye, EyeOff, Leaf, ArrowRight, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';

const BG_IMAGE =
  'https://images.unsplash.com/photo-1552825896-8059df63a1fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZydWl0cyUyMHZlZ2V0YWJsZXMlMjBtYXJrZXQlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzgxNjIyMjZ8MA&ixlib=rb-4.1.0&q=80&w=1080';

type Tab = 'login' | 'register';

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = await login(loginEmail, loginPassword);
    setIsSubmitting(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error ?? 'Error al iniciar sesión.');
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = await register(regName, regEmail, regPassword);
    setIsSubmitting(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error ?? 'Error al registrarse.');
    }
  };

  const fillDemo = () => {
    setLoginEmail('demo@freshcheck.app');
    setLoginPassword('demo1234');
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: illustration ── */}
      <div
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ backgroundColor: '#0e5c36' }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BG_IMAGE})`, opacity: 0.25 }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(14,92,54,0.92) 0%, rgba(26,122,74,0.75) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-11 h-11 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-2xl" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              FreshCheck
            </span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div>
            <h1
              className="text-white mb-3"
              style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em' }}
            >
              Calidad al instante,<br />frescura garantizada.
            </h1>
            <p className="text-white/70" style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
              Clasifica frutas y verduras con IA en segundos. Obtén reportes de frescura, condición y
              confianza con cada análisis.
            </p>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-3">
            {['🍎 Frutas', '🥦 Verduras', '📊 Reportes', '⚡ Tiempo real'].map((f) => (
              <span
                key={f}
                className="px-4 py-2 rounded-full text-white/90"
                style={{ background: 'rgba(255,255,255,0.15)', fontSize: '0.85rem', backdropFilter: 'blur(8px)' }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div
          className="relative z-10 p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
        >
          <p className="text-white/85 italic" style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>
            "FreshCheck redujo nuestras pérdidas por producto en mal estado en un 40% desde el primer mes."
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm"
              style={{ background: 'rgba(255,255,255,0.25)', fontWeight: 600 }}
            >
              MR
            </div>
            <div>
              <p className="text-white" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                María Rodríguez
              </p>
              <p className="text-white/60" style={{ fontSize: '0.78rem' }}>
                Supervisora de calidad, FreshMart
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ backgroundColor: '#1a7a4a' }}
            >
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a7a4a' }}>FreshCheck</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
              {tab === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              {tab === 'login'
                ? 'Inicia sesión para analizar tus productos.'
                : 'Únete a FreshCheck en segundos.'}
            </p>
          </div>

          {/* Tabs */}
          <div
            className="flex rounded-xl p-1 mb-7"
            style={{ backgroundColor: '#f1f5f9' }}
          >
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className="flex-1 py-2 rounded-lg transition-all"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: tab === t ? 600 : 400,
                  color: tab === t ? '#1a7a4a' : '#64748b',
                  backgroundColor: tab === t ? '#ffffff' : 'transparent',
                  boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 px-4 py-3 rounded-xl text-sm"
                style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <Field
                  label="Correo electrónico"
                  icon={<Mail className="w-4 h-4" />}
                  type="email"
                  placeholder="demo@freshcheck.app"
                  value={loginEmail}
                  onChange={setLoginEmail}
                  required
                />
                <Field
                  label="Contraseña"
                  icon={<Lock className="w-4 h-4" />}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={setLoginPassword}
                  required
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ color: '#94a3b8' }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                {/* Demo hint */}
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer"
                  style={{ backgroundColor: '#f0fdf4', border: '1px dashed #86efac' }}
                  onClick={fillDemo}
                >
                  <div>
                    <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#166534' }}>
                      Cuenta de demostración
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#4ade80' }}>
                      demo@freshcheck.app / demo1234
                    </p>
                  </div>
                  <span
                    className="px-2 py-1 rounded-lg text-xs"
                    style={{ backgroundColor: '#dcfce7', color: '#16a34a', fontWeight: 600 }}
                  >
                    Usar
                  </span>
                </div>

                <SubmitButton loading={isSubmitting} label="Iniciar sesión" />
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <Field
                  label="Nombre completo"
                  icon={<User className="w-4 h-4" />}
                  type="text"
                  placeholder="Tu nombre"
                  value={regName}
                  onChange={setRegName}
                  required
                />
                <Field
                  label="Correo electrónico"
                  icon={<Mail className="w-4 h-4" />}
                  type="email"
                  placeholder="tu@correo.com"
                  value={regEmail}
                  onChange={setRegEmail}
                  required
                />
                <Field
                  label="Contraseña"
                  icon={<Lock className="w-4 h-4" />}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={regPassword}
                  onChange={setRegPassword}
                  required
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ color: '#94a3b8' }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                <SubmitButton loading={isSubmitting} label="Crear cuenta" />
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer note */}
          <p className="text-center mt-8" style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Al continuar, aceptas los{' '}
            <span className="underline cursor-pointer" style={{ color: '#1a7a4a' }}>
              Términos de uso
            </span>{' '}
            y la{' '}
            <span className="underline cursor-pointer" style={{ color: '#1a7a4a' }}>
              Política de privacidad
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  rightSlot?: React.ReactNode;
}

function Field({ label, icon, type, placeholder, value, onChange, required, rightSlot }: FieldProps) {
  return (
    <div>
      <label
        style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}
      >
        {label}
      </label>
      <div
        className="flex items-center gap-3 px-4 rounded-xl transition-all"
        style={{
          border: '1.5px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          height: '46px',
        }}
        onFocus={() => {}}
      >
        <span style={{ color: '#94a3b8', flexShrink: 0 }}>{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="flex-1 bg-transparent outline-none"
          style={{ fontSize: '0.9rem', color: '#0f172a' }}
        />
        {rightSlot && <div className="flex-shrink-0">{rightSlot}</div>}
      </div>
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all mt-2"
      style={{
        backgroundColor: loading ? '#6db48a' : '#1a7a4a',
        color: 'white',
        fontWeight: 600,
        fontSize: '0.95rem',
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Procesando…
        </span>
      ) : (
        <>
          {label}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}
