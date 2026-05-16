import { useRef, useState, useCallback, DragEvent, ChangeEvent } from 'react';
import { Upload, Camera, FolderOpen, Scan, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { analyzeImage } from '../utils/analyzeImage';
import { WebcamModal } from './WebcamModal';
import { ImageWithFallback } from './figma/ImageWithFallback';

const SAMPLES = [
  {
    key: 'apple',
    label: 'Apple',
    dotColor: '#ef4444',
    imageUrl: 'https://images.unsplash.com/photo-1640496190768-61e38be6951d?w=400&q=80',
  },
  {
    key: 'banana',
    label: 'Banana',
    dotColor: '#eab308',
    imageUrl: 'https://images.unsplash.com/photo-1757332050958-b797a022c910?w=400&q=80',
  },
  {
    key: 'grape',
    label: 'Grape',
    dotColor: '#8b5cf6',
    imageUrl: 'https://images.unsplash.com/photo-1776371271965-965369a83f00?w=400&q=80',
  },
  {
    key: 'tomato',
    label: 'Tomato',
    dotColor: '#f97316',
    imageUrl: 'https://images.unsplash.com/photo-1700064165267-8fa68ef07167?w=400&q=80',
  },
];

const PRODUCE_DOTS = ['#ef4444', '#eab308', '#22c55e', '#8b5cf6', '#f97316'];

type Stage = 'Uploading' | 'Processing' | 'Classifying' | 'Done';
const STAGES: Stage[] = ['Uploading', 'Processing', 'Classifying', 'Done'];

export function UploadDashboard() {
  const navigate = useNavigate();
  const { setCurrentImage, setCurrentSampleHint, setAnalysisResult, addToHistory } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedHint, setSelectedHint] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStage, setAnalyzeStage] = useState(0);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');

  const handleSelectImage = (url: string, hint = '') => {
    setSelectedImage(url);
    setSelectedHint(hint);
  };

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => handleSelectImage(ev.target?.result as string, '');
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => handleSelectImage(ev.target?.result as string, '');
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setAnalyzeStage(0);
    setAnalyzeError('');

    // Progress through stages
    const stageTimings = [400, 750, 600];
    for (let i = 0; i < stageTimings.length; i++) {
      await new Promise(r => setTimeout(r, stageTimings[i]));
      setAnalyzeStage(i + 1);
    }

    try {
      const result = await analyzeImage(selectedImage, selectedHint);
      setCurrentImage(selectedImage);
      setCurrentSampleHint(selectedHint);
      setAnalysisResult(result);
      addToHistory(result);
      navigate('/results');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo analizar la imagen';
      setAnalyzeError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setSelectedHint('');
  };

  return (
    <>
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="max-w-2xl mx-auto">

          {/* Hero text */}
          <motion.div
            className="text-center mb-8 sm:mb-10"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
              style={{ background: '#dcfce7', color: '#16a34a' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>AI-Powered Classification</span>
            </div>
            <h1 className="mb-2" style={{ color: '#0f3d22', lineHeight: 1.25, fontSize: '1.875rem', fontWeight: 700 }}>
              Check Freshness Instantly
            </h1>
            <p style={{ color: '#4b6b59', fontSize: '1rem', maxWidth: '420px', margin: '0 auto' }}>
              Upload a photo of any fruit or vegetable and our AI will classify its type and quality in seconds.
            </p>
          </motion.div>

          {/* Upload Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !selectedImage && fileInputRef.current?.click()}
              className="relative rounded-2xl transition-all duration-200 overflow-hidden"
              style={{
                border: `2px dashed ${dragOver ? '#1a7a4a' : '#a7d4bb'}`,
                background: dragOver ? '#e6f5ec' : selectedImage ? '#f8faf9' : 'white',
                cursor: selectedImage ? 'default' : 'pointer',
                minHeight: '280px',
              }}
            >
              {selectedImage ? (
                /* Image Preview */
                <div className="relative">
                  <ImageWithFallback
                    src={selectedImage}
                    alt="Selected produce"
                    className="w-full object-cover rounded-2xl"
                    style={{ maxHeight: '340px', objectFit: 'cover' }}
                  />
                  {/* Overlay */}
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }}
                  />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="px-2.5 py-1 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
                      >
                        <span style={{ color: '#1a7a4a', fontSize: '0.78rem', fontWeight: 600 }}>
                          ✓ Image ready for analysis
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleReset(); }}
                      className="px-3 py-1 rounded-lg transition-colors"
                      style={{
                        background: 'rgba(0,0,0,0.45)',
                        color: 'white',
                        fontSize: '0.78rem',
                        fontWeight: 500,
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Drop Zone */
                <div className="flex flex-col items-center justify-center gap-4 p-8 sm:p-12 text-center">
                  <motion.div
                    animate={dragOver ? { scale: 1.12 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="flex items-center justify-center w-16 h-16 rounded-2xl"
                    style={{ background: '#e8f5ee' }}
                  >
                    <Upload className="w-7 h-7" style={{ color: '#1a7a4a' }} />
                  </motion.div>

                  <div>
                    <p style={{ color: '#1a1a1a', fontWeight: 600, fontSize: '1.05rem', marginBottom: '4px' }}>
                      Drag &amp; drop or click to upload
                    </p>
                    <p style={{ color: '#888', fontSize: '0.85rem' }}>
                      Supports JPG, PNG, WEBP up to 20 MB
                    </p>
                  </div>

                  {/* Produce color dots */}
                  <div className="flex items-center gap-2">
                    {PRODUCE_DOTS.map((color, i) => (
                      <motion.div
                        key={i}
                        className="rounded-full"
                        style={{ width: '10px', height: '10px', background: color, opacity: 0.8 }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.05, type: 'spring', stiffness: 400 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex gap-3 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => setIsWebcamOpen(true)}
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
              <Camera className="w-4 h-4" />
              Capture from Webcam
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
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
              <FolderOpen className="w-4 h-4" />
              Browse Local Files
            </button>
          </motion.div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Analyze Button */}
          <AnimatePresence>
            {selectedImage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25 }}
                className="mt-4"
              >
                <button
                  onClick={handleAnalyze}
                  className="w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-opacity"
                  style={{
                    background: 'linear-gradient(135deg, #1a7a4a 0%, #1e8f56 100%)',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 16px rgba(26,122,74,0.28)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.93')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <Scan className="w-5 h-5" />
                  Analyze Image
                </button>
                {analyzeError && (
                  <p className="mt-3 text-sm text-center" style={{ color: '#dc2626' }}>
                    {analyzeError}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Samples */}
          <motion.div
            className="mt-8 sm:mt-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p
              className="text-center mb-4"
              style={{ color: '#7a9a86', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}
            >
              Quick Samples — Try instantly
            </p>
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              {SAMPLES.map((sample) => (
                <motion.button
                  key={sample.key}
                  onClick={() => handleSelectImage(sample.imageUrl, sample.key)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-colors"
                  style={{
                    background: selectedHint === sample.key ? '#e8f5ee' : 'white',
                    border: `1.5px solid ${selectedHint === sample.key ? '#1a7a4a' : '#e8e8e8'}`,
                  }}
                >
                  <div className="relative">
                    <ImageWithFallback
                      src={sample.imageUrl}
                      alt={sample.label}
                      className="rounded-lg object-cover"
                      style={{ width: '48px', height: '48px' }}
                    />
                    <div
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white"
                      style={{ background: sample.dotColor }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedHint === sample.key && (
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: '#1a7a4a' }} />
                    )}
                    <span style={{ color: '#333', fontSize: '0.8rem', fontWeight: 500 }}>
                      {sample.label}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Webcam Modal */}
      <WebcamModal
        isOpen={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onCapture={(dataUrl) => handleSelectImage(dataUrl, '')}
      />

      {/* Analyzing Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center"
            style={{ background: 'rgba(0,10,5,0.72)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex flex-col items-center gap-6 p-8 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', maxWidth: '340px', width: '100%' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Preview thumbnail */}
              <div className="relative">
                <ImageWithFallback
                  src={selectedImage!}
                  alt="Analyzing"
                  className="rounded-2xl object-cover"
                  style={{ width: '100px', height: '100px' }}
                />
                {/* Scanning line animation */}
                <motion.div
                  className="absolute left-0 right-0 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, transparent, #4ade80, transparent)' }}
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                />
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{ border: '2px solid rgba(74, 222, 128, 0.5)' }}
                />
              </div>

              <div className="text-center">
                <p style={{ color: 'white', fontWeight: 600, fontSize: '1.05rem', marginBottom: '4px' }}>
                  Analyzing your produce…
                </p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
                  EfficientNet · 14 produce types · Healthy / Rotten
                </p>
              </div>

              {/* Stage indicators */}
              <div className="flex flex-col gap-2 w-full">
                {STAGES.slice(0, 3).map((stage, i) => {
                  const isActive = analyzeStage === i;
                  const isDone = analyzeStage > i;
                  return (
                    <div key={stage} className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 transition-colors"
                        style={{
                          background: isDone ? '#1a7a4a' : isActive ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.1)',
                          border: isActive ? '1.5px solid #4ade80' : 'none',
                        }}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-3 h-3" style={{ color: 'white' }} />
                        ) : isActive ? (
                          <motion.div
                            className="w-2 h-2 rounded-full"
                            style={{ background: '#4ade80' }}
                            animate={{ scale: [1, 1.4, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          />
                        ) : (
                          <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
                        )}
                      </div>
                      <span
                        style={{
                          color: isDone ? 'rgba(255,255,255,0.5)' : isActive ? 'white' : 'rgba(255,255,255,0.3)',
                          fontSize: '0.85rem',
                          fontWeight: isActive ? 500 : 400,
                        }}
                      >
                        {stage}…
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Animated progress bar */}
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #1a7a4a, #4ade80)' }}
                  initial={{ width: '5%' }}
                  animate={{ width: `${5 + analyzeStage * 32}%` }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
