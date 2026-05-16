import { X, Settings, Sliders, Bell, Shield, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useState } from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative flex-shrink-0 rounded-full transition-colors duration-200"
      style={{
        width: '42px',
        height: '24px',
        background: checked ? '#1a7a4a' : '#d1d5db',
      }}
    >
      <div
        className="absolute top-1 rounded-full bg-white transition-transform duration-200"
        style={{
          width: '16px',
          height: '16px',
          transform: checked ? 'translateX(20px)' : 'translateX(4px)',
        }}
      />
    </button>
  );
}

export function SettingsModal() {
  const { isSettingsOpen, setIsSettingsOpen, clearHistory } = useApp();
  const [notifications, setNotifications] = useState(true);
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [highResMode, setHighResMode] = useState(false);
  const [threshold, setThreshold] = useState(75);

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsSettingsOpen(false); }}
        >
          <motion.div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh' }}
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" style={{ color: '#1a7a4a' }} />
                <span style={{ fontWeight: 600, color: '#111', fontSize: '1rem' }}>Settings</span>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                style={{ color: '#666' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 130px)' }}>
              {/* Model Settings */}
              <section className="px-6 py-5 border-b border-gray-50">
                <div className="flex items-center gap-2 mb-4">
                  <Sliders className="w-4 h-4" style={{ color: '#1a7a4a' }} />
                  <span style={{ fontWeight: 600, color: '#333', fontSize: '0.875rem' }}>Model Settings</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label style={{ color: '#555', fontSize: '0.875rem' }}>Confidence Threshold</label>
                      <span
                        className="px-2 py-0.5 rounded-full"
                        style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        {threshold}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={99}
                      value={threshold}
                      onChange={e => setThreshold(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: '#1a7a4a' }}
                    />
                    <div className="flex justify-between mt-1">
                      <span style={{ color: '#aaa', fontSize: '0.7rem' }}>50%</span>
                      <span style={{ color: '#aaa', fontSize: '0.7rem' }}>99%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p style={{ color: '#333', fontSize: '0.875rem', fontWeight: 500 }}>Auto-Analyze on Upload</p>
                      <p style={{ color: '#888', fontSize: '0.78rem' }}>Start analysis immediately after file selection</p>
                    </div>
                    <Toggle checked={autoAnalyze} onChange={setAutoAnalyze} />
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p style={{ color: '#333', fontSize: '0.875rem', fontWeight: 500 }}>High-Res Processing</p>
                      <p style={{ color: '#888', fontSize: '0.78rem' }}>Slower but more accurate results</p>
                    </div>
                    <Toggle checked={highResMode} onChange={setHighResMode} />
                  </div>
                </div>
              </section>

              {/* Notifications */}
              <section className="px-6 py-5 border-b border-gray-50">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-4 h-4" style={{ color: '#1a7a4a' }} />
                  <span style={{ fontWeight: 600, color: '#333', fontSize: '0.875rem' }}>Notifications</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p style={{ color: '#333', fontSize: '0.875rem', fontWeight: 500 }}>Analysis Alerts</p>
                    <p style={{ color: '#888', fontSize: '0.78rem' }}>Notify when analysis is complete</p>
                  </div>
                  <Toggle checked={notifications} onChange={setNotifications} />
                </div>
              </section>

              {/* Privacy */}
              <section className="px-6 py-5 border-b border-gray-50">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4" style={{ color: '#1a7a4a' }} />
                  <span style={{ fontWeight: 600, color: '#333', fontSize: '0.875rem' }}>Privacy &amp; Data</span>
                </div>
                <div
                  className="flex items-start gap-2 p-3 rounded-xl mb-3"
                  style={{ background: '#f0f7f3' }}
                >
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#1a7a4a' }} />
                  <p style={{ color: '#555', fontSize: '0.8rem', lineHeight: 1.5 }}>
                    Images are processed locally and are not stored on any server. History is saved only in your browser session.
                  </p>
                </div>
                <button
                  onClick={() => { clearHistory(); }}
                  className="w-full py-2.5 rounded-xl border transition-colors"
                  style={{
                    border: '1.5px solid #fee2e2',
                    color: '#dc2626',
                    background: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                >
                  Clear All History
                </button>
              </section>

              {/* About */}
              <section className="px-6 py-5">
                <p style={{ color: '#aaa', fontSize: '0.78rem', textAlign: 'center' }}>
                  FreshCheck · EfficientNet multi-output (14 + 2 heads)
                </p>
              </section>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-full py-3 rounded-xl text-white transition-opacity"
                style={{ background: '#1a7a4a', fontSize: '0.9rem', fontWeight: 500 }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Save &amp; Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
