import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, CheckCircle2, AlertTriangle, Clock3, Zap,
  FileDown, RefreshCcw, Tag, Leaf, BarChart2, Info,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp, AnalysisResult } from '../context/AppContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

/* ── Condition badge ───────────────────────────────────────────────────── */
function ConditionBadge({ condition }: { condition: AnalysisResult['condition'] }) {
  const styles: Record<string, { bg: string; color: string; icon: JSX.Element }> = {
    Healthy:  { bg: '#dcfce7', color: '#16a34a', icon: <CheckCircle2 className="w-4 h-4" /> },
    Damaged:  { bg: '#fee2e2', color: '#dc2626', icon: <AlertTriangle className="w-4 h-4" /> },
    Overripe: { bg: '#fef9c3', color: '#b45309', icon: <AlertTriangle className="w-4 h-4" /> },
  };
  const { bg, color, icon } = styles[condition];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
      style={{ background: bg, color, fontWeight: 700, fontSize: '0.9rem' }}
    >
      {icon} {condition}
    </span>
  );
}

/* ── Confidence bar ────────────────────────────────────────────────────── */
function ConfidenceBar({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300 + delay);
    return () => clearTimeout(t);
  }, [delay]);

  const barColor = value >= 90 ? '#1a7a4a' : value >= 75 ? '#eab308' : '#ef4444';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span style={{ color: '#555', fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
        <span style={{ color: '#111', fontSize: '0.875rem', fontWeight: 700 }}>{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: '#f0f0f0' }}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: animated ? `${value}%` : '0%', background: barColor }}
        />
      </div>
    </div>
  );
}

/* ── Info tile ─────────────────────────────────────────────────────────── */
function InfoTile({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: JSX.Element;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-2 p-4 rounded-xl"
      style={{
        background: accent ? '#f0f9f4' : '#fafafa',
        border: `1px solid ${accent ? '#c6e8d6' : '#f0f0f0'}`,
      }}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg"
        style={{ background: accent ? '#dcfce7' : '#f0f0f0' }}
      >
        <span style={{ color: accent ? '#1a7a4a' : '#666' }}>{icon}</span>
      </div>
      <div>
        <p style={{ color: '#888', fontSize: '0.72rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </p>
        <p style={{ color: '#111', fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>{value}</p>
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────── */
export function AnalysisResults() {
  const navigate = useNavigate();
  const { analysisResult, currentImage, setCurrentImage, setAnalysisResult } = useApp();

  useEffect(() => {
    if (!analysisResult) {
      navigate('/', { replace: true });
    }
  }, [analysisResult, navigate]);

  if (!analysisResult) return null;

  const r = analysisResult;

  const handleExport = () => {
    const data = {
      id: r.id,
      produceName: r.produceName,
      produceType: r.produceType,
      condition: r.condition,
      fruitTypeConfidence: r.fruitTypeConfidence,
      conditionConfidence: r.conditionConfidence,
      latency: `${r.latency}ms`,
      resolution: r.resolution,
      fileSize: r.fileSize,
      analysedAt: r.timestamp.toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freshcheck-report-${r.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNewAnalysis = () => {
    setCurrentImage(null);
    setAnalysisResult(null);
    navigate('/');
  };

  const conditionIcon = r.condition === 'Healthy'
    ? <CheckCircle2 className="w-3.5 h-3.5" />
    : <AlertTriangle className="w-3.5 h-3.5" />;

  return (
    <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto">

        {/* Back button */}
        <motion.button
          onClick={handleNewAnalysis}
          className="flex items-center gap-2 mb-6 rounded-lg px-3 py-2 transition-colors"
          style={{ color: '#1a7a4a' }}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          onMouseEnter={e => (e.currentTarget.style.background = '#e8f5ee')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <ArrowLeft className="w-4 h-4" />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Back to Upload</span>
        </motion.button>

        {/* Main grid: 2-col desktop / 1-col mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Left column: Image ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative rounded-2xl overflow-hidden bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #efefef' }}>
              <ImageWithFallback
                src={currentImage || r.imageUrl}
                alt={r.produceName}
                className="w-full object-cover"
                style={{ maxHeight: '420px', minHeight: '260px', objectFit: 'cover' }}
              />

              {/* Metadata overlay badge */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
                >
                  <Info className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.7)' }} />
                  <span style={{ color: 'white', fontSize: '0.72rem', fontWeight: 500 }}>{r.resolution}</span>
                </div>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
                >
                  <Leaf className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.7)' }} />
                  <span style={{ color: 'white', fontSize: '0.72rem', fontWeight: 500 }}>{r.fileSize}</span>
                </div>
              </div>

              {/* Bottom gradient with produce name */}
              <div
                className="absolute bottom-0 left-0 right-0 px-5 py-4"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)' }}
              >
                <div className="flex items-end justify-between">
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem', fontWeight: 500 }}>Detected</p>
                    <h2 style={{ color: 'white', fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.1 }}>
                      {r.produceName}
                    </h2>
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                    style={{
                      background: r.condition === 'Healthy'
                        ? 'rgba(22,163,74,0.85)'
                        : r.condition === 'Damaged'
                          ? 'rgba(220,38,38,0.85)'
                          : 'rgba(180,83,9,0.85)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <span style={{ color: 'white' }}>{conditionIcon}</span>
                    <span style={{ color: 'white', fontSize: '0.82rem', fontWeight: 700 }}>{r.condition}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <p className="mt-2 text-center" style={{ color: '#aaa', fontSize: '0.75rem' }}>
              Analysed at {r.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              {' · '}
              {r.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </motion.div>

          {/* ── Right column: Results card ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.06 }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'white', border: '1px solid #efefef', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              {/* Card header */}
              <div className="px-6 py-5 border-b border-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p style={{ color: '#888', fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Classification Result
                    </p>
                    <h2 style={{ color: '#0f1a13', fontWeight: 700, fontSize: '1.6rem', lineHeight: 1.15, marginTop: '4px' }}>
                      {r.produceName}
                    </h2>
                  </div>
                  <ConditionBadge condition={r.condition} />
                </div>

                {r.condition !== 'Healthy' && (
                  <div
                    className="mt-4 flex items-start gap-2 p-3 rounded-xl"
                    style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#c2410c' }} />
                    <p style={{ color: '#9a3412', fontSize: '0.82rem', lineHeight: 1.5 }}>
                      {r.condition === 'Damaged'
                        ? 'This produce shows signs of spoilage or rot (model: Rotten). Recommend immediate inspection.'
                        : 'This produce appears overripe. Best consumed soon or used in cooking/processing.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Confidence bars */}
              <div className="px-6 py-5 space-y-4 border-b border-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart2 className="w-4 h-4" style={{ color: '#1a7a4a' }} />
                  <span style={{ color: '#333', fontSize: '0.875rem', fontWeight: 600 }}>Confidence Scores</span>
                </div>
                <ConfidenceBar label="Fruit / Vegetable Type" value={r.fruitTypeConfidence} delay={0} />
                <ConfidenceBar label="Quality Condition" value={r.conditionConfidence} delay={150} />
              </div>

              {/* 2×2 Metrics grid */}
              <div className="px-6 py-5 border-b border-gray-50">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4" style={{ color: '#1a7a4a' }} />
                  <span style={{ color: '#333', fontSize: '0.875rem', fontWeight: 600 }}>Details</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InfoTile
                    icon={<Leaf className="w-4 h-4" />}
                    label="Produce Type"
                    value={r.produceType}
                    accent
                  />
                  <InfoTile
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    label="Condition"
                    value={r.condition}
                    accent={r.condition === 'Healthy'}
                  />
                  <InfoTile
                    icon={<BarChart2 className="w-4 h-4" />}
                    label="Confidence"
                    value={`${r.fruitTypeConfidence}%`}
                  />
                  <InfoTile
                    icon={<Zap className="w-4 h-4" />}
                    label="Latency"
                    value={`${r.latency} ms`}
                  />
                </div>
              </div>

              {/* Model info strip */}
              <div className="px-6 py-3 border-b border-gray-50" style={{ background: '#f8faf8' }}>
                <div className="flex items-center gap-1.5">
                  <Clock3 className="w-3.5 h-3.5" style={{ color: '#aaa' }} />
                  <span style={{ color: '#aaa', fontSize: '0.75rem' }}>
                    Processed by EfficientNet multi-output · {r.timestamp.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-6 py-5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleNewAnalysis}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-opacity"
                  style={{
                    background: '#1a7a4a',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#155e38')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#1a7a4a')}
                >
                  <RefreshCcw className="w-4 h-4" />
                  Analyze New Image
                </button>

                <button
                  onClick={handleExport}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors"
                  style={{
                    border: '1.5px solid #1a7a4a',
                    color: '#1a7a4a',
                    background: 'white',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f0f9f4')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                >
                  <FileDown className="w-4 h-4" />
                  Export Report
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom tip */}
        <motion.div
          className="mt-6 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Info className="w-3.5 h-3.5" style={{ color: '#1a7a4a', opacity: 0.6 }} />
          <p style={{ color: '#7a9a86', fontSize: '0.78rem' }}>
            Results are AI-generated estimates. Always verify produce quality visually before consumption.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
