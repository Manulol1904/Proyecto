import { useEffect, useRef, useState } from 'react';
import { X, Camera, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WebcamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export function WebcamModal({ isOpen, onClose, onCapture }: WebcamModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setReady(false);
      setCaptured(null);
      return;
    }

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setReady(true);
        }
      } catch {
        setError('Camera access was denied or is not available on this device.');
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCaptured(dataUrl);
  };

  const handleUse = () => {
    if (captured) {
      onCapture(captured);
      onClose();
    }
  };

  const handleRetake = () => {
    setCaptured(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-lg"
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5" style={{ color: '#1a7a4a' }} />
                <span style={{ fontWeight: 600, color: '#111', fontSize: '1rem' }}>Capture from Webcam</span>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                style={{ color: '#666' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {error ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <div
                    className="flex items-center justify-center w-14 h-14 rounded-2xl"
                    style={{ background: '#fef2f2' }}
                  >
                    <AlertCircle className="w-7 h-7" style={{ color: '#dc2626' }} />
                  </div>
                  <p style={{ color: '#555', fontSize: '0.9rem', maxWidth: '280px' }}>{error}</p>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-xl bg-black" style={{ aspectRatio: '4/3' }}>
                  {!captured ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {!ready && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#111' }}>
                          <div className="flex flex-col items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                              style={{ borderColor: '#1a7a4a', borderTopColor: 'transparent' }}
                            />
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                              Initializing camera...
                            </span>
                          </div>
                        </div>
                      )}
                      {/* Viewfinder corners */}
                      {ready && (
                        <>
                          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: '#1a7a4a' }} />
                          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: '#1a7a4a' }} />
                          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: '#1a7a4a' }} />
                          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: '#1a7a4a' }} />
                        </>
                      )}
                    </>
                  ) : (
                    <img src={captured} alt="Captured" className="w-full h-full object-cover" />
                  )}
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />

              {/* Actions */}
              {!error && (
                <div className="flex gap-3 mt-4">
                  {!captured ? (
                    <>
                      <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border transition-colors"
                        style={{
                          border: '1.5px solid #d1d5db',
                          color: '#555',
                          background: 'white',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCapture}
                        disabled={!ready}
                        className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-opacity"
                        style={{
                          background: ready ? '#1a7a4a' : '#9ca3af',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          cursor: ready ? 'pointer' : 'not-allowed',
                        }}
                      >
                        <Camera className="w-4 h-4" />
                        Capture
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleRetake}
                        className="flex-1 py-3 rounded-xl border transition-colors"
                        style={{
                          border: '1.5px solid #d1d5db',
                          color: '#555',
                          background: 'white',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                      >
                        Retake
                      </button>
                      <button
                        onClick={handleUse}
                        className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
                        style={{
                          background: '#1a7a4a',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                        }}
                      >
                        Use This Photo
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
