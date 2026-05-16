import { X, Clock, Trash2, CheckCircle2, AlertTriangle, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, AnalysisResult } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';

function ConditionBadge({ condition }: { condition: AnalysisResult['condition'] }) {
  const map = {
    Healthy:  { bg: '#dcfce7', color: '#16a34a', icon: <CheckCircle2 className="w-3 h-3" /> },
    Damaged:  { bg: '#fee2e2', color: '#dc2626', icon: <AlertTriangle className="w-3 h-3" /> },
    Overripe: { bg: '#fef9c3', color: '#b45309', icon: <AlertTriangle className="w-3 h-3" /> },
  };
  const { bg, color, icon } = map[condition];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
      style={{ background: bg, color, fontSize: '0.7rem', fontWeight: 600 }}
    >
      {icon} {condition}
    </span>
  );
}

export function HistoryPanel() {
  const { isHistoryOpen, setIsHistoryOpen, history, clearHistory, setCurrentImage, setAnalysisResult } = useApp();
  const navigate = useNavigate();

  const handleView = (item: AnalysisResult) => {
    setCurrentImage(item.imageUrl);
    setAnalysisResult(item);
    setIsHistoryOpen(false);
    navigate('/results');
  };

  return (
    <AnimatePresence>
      {isHistoryOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.35)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsHistoryOpen(false)}
          />

          {/* Panel */}
          <motion.aside
            className="fixed top-0 right-0 bottom-0 z-[70] flex flex-col bg-white"
            style={{ width: 'min(400px, 100vw)', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b border-gray-100"
              style={{ minHeight: '64px' }}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: '#1a7a4a' }} />
                <span style={{ fontWeight: 600, color: '#111', fontSize: '1rem' }}>Analysis History</span>
                {history.length > 0 && (
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    {history.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                style={{ color: '#666' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto py-3">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                  <div
                    className="flex items-center justify-center w-16 h-16 rounded-2xl"
                    style={{ background: '#f0f7f3' }}
                  >
                    <Leaf className="w-8 h-8" style={{ color: '#1a7a4a', opacity: 0.4 }} />
                  </div>
                  <div>
                    <p style={{ color: '#333', fontWeight: 500, marginBottom: '4px' }}>No analyses yet</p>
                    <p style={{ color: '#888', fontSize: '0.85rem' }}>
                      Upload a fruit or vegetable image to get started.
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="px-4 space-y-2">
                  {history.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => handleView(item)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors"
                        style={{ border: '1px solid #f0f0f0' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f0f7f3')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                      >
                        <ImageWithFallback
                          src={item.imageUrl}
                          alt={item.produceName}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          style={{ border: '1px solid #e5e7eb' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span style={{ fontWeight: 600, color: '#111', fontSize: '0.9rem' }}>
                              {item.produceName}
                            </span>
                            <ConditionBadge condition={item.condition} />
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span style={{ color: '#888', fontSize: '0.75rem' }}>
                              {item.fruitTypeConfidence}% confidence
                            </span>
                            <span style={{ color: '#bbb', fontSize: '0.7rem' }}>
                              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <div className="px-4 py-4 border-t border-gray-100">
                <button
                  onClick={clearHistory}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-colors"
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
                  <Trash2 className="w-4 h-4" />
                  Clear History
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}