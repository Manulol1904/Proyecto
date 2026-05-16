import { History, Settings, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const { setIsHistoryOpen, setIsSettingsOpen } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    setAvatarMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header
      className="sticky top-0 z-50 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: '#1a7a4a' }}
    >
      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-3 group"
      >
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.18)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.5 2 2 8.5 2 14c0 4 3.5 8 10 8 2.5-3 4-6 4-8.5 0-3-2-5.5-4-7 1.5 2 2.5 4 2.5 6.5 0 2-.5 4-1.5 6 4-1.5 7-5 7-9 0-5-3.5-8-8-8z"
              fill="white"
            />
          </svg>
        </div>
        <div className="text-left">
          <div className="text-white font-semibold tracking-tight" style={{ fontSize: '1.125rem', lineHeight: 1.2 }}>
            FreshCheck
          </div>
          <div
            className="hidden sm:block"
            style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem', lineHeight: 1 }}
          >
            Fruit &amp; Vegetable Classifier
          </div>
        </div>
      </button>

      {/* Actions */}
      <nav className="flex items-center gap-1">
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.8)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <History className="w-[18px] h-[18px]" />
          <span className="hidden sm:inline" style={{ fontSize: '0.875rem' }}>History</span>
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.8)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Settings className="w-[18px] h-[18px]" />
          <span className="hidden sm:inline" style={{ fontSize: '0.875rem' }}>Settings</span>
        </button>

        {/* User avatar + dropdown */}
        {user && (
          <div className="relative ml-1" ref={menuRef}>
            <button
              onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg transition-colors"
              style={{ color: 'rgba(255,255,255,0.9)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseLeave={e => !avatarMenuOpen && (e.currentTarget.style.background = 'transparent')}
            >
              {/* Avatar circle */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'white',
                  letterSpacing: '0.03em',
                }}
              >
                {user.avatarInitials}
              </div>
              <span className="hidden sm:inline" style={{ fontSize: '0.875rem', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name.split(' ')[0]}
              </span>
            </button>

            {/* Dropdown menu */}
            {avatarMenuOpen && (
              <div
                className="absolute right-0 mt-2 rounded-xl shadow-xl overflow-hidden"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  minWidth: '200px',
                  zIndex: 100,
                }}
              >
                {/* User info */}
                <div className="px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{user.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1px' }}>{user.email}</p>
                </div>
                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                  style={{ fontSize: '0.875rem', color: '#dc2626' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
