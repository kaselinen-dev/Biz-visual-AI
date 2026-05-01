/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Sparkles, 
  Layout, 
  Sun, 
  Contrast, 
  Download, 
  RefreshCcw, 
  History,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PROFESSIONAL_PRESETS, EditedImage } from './types';
import { editBusinessImage, generateProfessionalImage } from './services/geminiService';
import { fileToBase64, downloadImage } from './lib/utils';

export default function App() {
  const [originalImage, setOriginalImage] = useState<{url: string, base64: string, mime: string} | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<EditedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      setOriginalImage({
        url: URL.createObjectURL(file),
        base64,
        mime: file.type
      });
      setEditedImage(null);
      setError(null);
    } catch (err) {
      setError("Failed to load image. Please try another one.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  const handleEdit = async (customPrompt?: string) => {
    if (!originalImage && !customPrompt && !prompt) {
      // Just a small check to ensure we don't call the API with absolutely nothing, 
      // although the service would handle it, it's better to stay safe.
      // But per user request "even if not filled", I will let it proceed if any is present.
    }

    setIsProcessing(true);
    setError(null);

    const targetPrompt = customPrompt || prompt;

    try {
      let resultUrl: string | null = null;
      
      if (originalImage) {
        resultUrl = await editBusinessImage(
          originalImage.base64,
          originalImage.mime,
          targetPrompt
        );
      } else {
        // AI image generation if no image uploaded
        resultUrl = await generateProfessionalImage(targetPrompt);
      }

      if (resultUrl) {
        setEditedImage(resultUrl);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0052CC', '#172B4D', '#FFFFFF']
        });

        const newEntry: EditedImage = {
          id: crypto.randomUUID(),
          originalUrl: originalImage?.url || resultUrl,
          editedUrl: resultUrl,
          prompt: targetPrompt,
          timestamp: Date.now()
        };
        setHistory(prev => [newEntry, ...prev]);
      } else {
        setError("AI failed to process the image. Please try a different prompt.");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred during AI processing.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles size={18} />;
      case 'Layout': return <Layout size={18} />;
      case 'Sun': return <Sun size={18} />;
      case 'Contrast': return <Contrast size={18} />;
      default: return <Sparkles size={18} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-subtle selection:bg-brand-accent/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border-subtle px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-brand-primary p-2.5 rounded-xl text-white shadow-lg shadow-brand-primary/20">
            <ImageIcon size={24} />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-brand-primary">
            BizVisual <span className="text-brand-accent">AI</span>
          </h1>
        </div>
      </header>

      <main className="flex-1 lg:grid lg:grid-cols-12 overflow-hidden max-w-[1920px] mx-auto w-full">
        {/* Left Sidebar: Controls */}
        <aside className="lg:col-span-4 border-r border-border-subtle bg-white overflow-y-auto p-8 flex flex-col gap-10">
          
          {/* Section Heading Decorator */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-4 bg-brand-gold rounded-full"></div>
              <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">1. Corporate Origin</h2>
            </div>
            
            <div 
              {...getRootProps()} 
              className={`
                premium-card overflow-hidden transition-all cursor-pointer group
                ${isDragActive ? 'ring-2 ring-brand-accent ring-offset-2 bg-brand-accent/5' : ''}
              `}
              id="drop-area"
            >
              <input {...getInputProps()} />
              {originalImage ? (
                <div className="relative group">
                  <div className="aspect-video relative overflow-hidden bg-gray-50">
                    <img 
                      src={originalImage.url} 
                      alt="Original" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-brand-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white text-brand-primary px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl">
                        <RefreshCcw size={14} /> REPLACE SOURCE
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-border-subtle m-4 rounded-xl">
                  <div className="w-14 h-14 bg-bg-subtle rounded-2xl flex items-center justify-center text-brand-accent mb-4 shadow-inner">
                    <Upload size={28} />
                  </div>
                  <p className="text-brand-primary font-bold">Upload Executive Media</p>
                  <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-medium">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
          </section>

          {/* Presets Section */}
          <section>
             <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-4 bg-brand-gold rounded-full"></div>
              <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">2. Executive Presets</h2>
            </div>
            <div className="grid grid-cols-2 gap-4" id="presets-grid">
              {PROFESSIONAL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleEdit(preset.prompt)}
                  disabled={isProcessing}
                  className="premium-card flex flex-col items-start gap-3 p-5 text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                  id={`preset-${preset.id}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-bg-subtle flex items-center justify-center text-gray-400 group-hover:text-brand-accent group-hover:bg-brand-accent/10 transition-all">
                    {getIcon(preset.icon)}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary leading-tight">{preset.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Custom Prompt */}
          <section className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-4 bg-brand-gold rounded-full"></div>
              <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">3. Strategic Refinement</h2>
            </div>
            <div className="flex flex-col gap-4">
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Enhance clarity for a board meeting presentation... "
                  className="w-full h-36 p-6 bg-bg-subtle border border-border-subtle rounded-2xl focus:ring-1 focus:ring-brand-accent focus:border-brand-accent outline-none font-medium text-brand-primary placeholder:text-gray-400 transition-all text-sm shadow-inner"
                  id="prompt-input"
                />
                <div className="absolute bottom-4 right-4 opacity-50">
                  <Sparkles size={16} className="text-brand-accent" />
                </div>
              </div>
              
              <button
                onClick={() => handleEdit()}
                disabled={isProcessing}
                className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-primary/10 group active:scale-[0.98]"
                id="generate-button"
              >
                {isProcessing ? (
                  <>
                    <RefreshCcw size={20} className="animate-spin" />
                    AI ANALYSIS IN PROGRESS...
                  </>
                ) : (
                  <>
                    {originalImage ? <Sparkles size={20} className="group-hover:rotate-12 transition-transform" /> : <Plus size={20} />}
                    <span className="tracking-widest uppercase text-xs font-black">
                      {originalImage ? 'Execute Enhancement' : 'Compose Vision'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </section>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 text-red-700 text-xs font-medium leading-relaxed"
            >
              <AlertCircle size={20} className="shrink-0" />
              {error}
            </motion.div>
          )}
        </aside>

        {/* Right Area: Preview & Comparison */}
        <div className="lg:col-span-8 bg-bg-subtle p-12 overflow-y-auto">
          <div className="max-w-4xl mx-auto h-full flex flex-col gap-10">
            
            {/* Main Preview Container */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {!originalImage && !editedImage ? (
                <div className="text-center select-none py-28 flex flex-col items-center">
                  <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-brand-accent/20 mb-8 border border-white/50">
                    <ImageIcon size={48} />
                  </div>
                  <h3 className="text-2xl font-display font-medium text-brand-primary mb-2 italic">Awaiting Strategic Input</h3>
                  <p className="text-xs text-gray-400 uppercase tracking-[0.3em] font-medium">Digital Presentation Studio</p>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-brand-primary text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse"></span>
                        Master Canvas
                      </h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Previewing 4K Professional Output</p>
                    </div>
                    {editedImage && (
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            setOriginalImage({
                              url: editedImage,
                              base64: editedImage.split(',')[1],
                              mime: editedImage.split(';')[0].split(':')[1]
                            });
                            setEditedImage(null);
                          }}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] bg-white text-brand-primary border border-border-subtle px-4 py-3 rounded-full shadow-sm hover:border-brand-accent hover:text-brand-accent transition-all active:scale-95"
                        >
                          <RefreshCcw size={14} /> Use as Source
                        </button>
                        <button 
                          onClick={() => downloadImage(editedImage, `bizvisual-edited-${Date.now()}.png`)}
                          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] bg-brand-primary text-white px-6 py-3 rounded-full shadow-lg shadow-brand-primary/20 hover:bg-brand-accent transition-all active:scale-95"
                        >
                          <Download size={14} /> EXPORT FINAL COPY
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative rounded-3xl overflow-hidden bg-white shadow-[0_32px_64px_-12px_rgba(15,23,42,0.12)] border border-border-subtle flex flex-col group/canvas">
                    <div className="flex-1 bg-[#fcfcfc] min-h-[480px] p-8 flex items-center justify-center relative">
                      {/* Grid overlay for aesthetic */}
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                      
                      <AnimatePresence mode="wait">
                        {isProcessing ? (
                          <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-10 glass-panel flex flex-col items-center justify-center"
                          >
                            <div className="w-20 h-20 relative">
                              <motion.div 
                                animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                className="absolute border-[6px] border-brand-accent/20 border-t-brand-accent rounded-full inset-0 shadow-lg"
                              />
                            </div>
                            <div className="mt-8 flex flex-col items-center gap-2">
                              <p className="font-display font-medium text-brand-primary tracking-tight">AI Render Engine Active</p>
                              <div className="flex gap-1">
                                {[0,1,2].map(i => (
                                  <motion.div 
                                    key={i}
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                    className="w-1 h-1 bg-brand-accent rounded-full"
                                  />
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        ) : null}

                        <motion.img 
                          key={editedImage || originalImage?.url}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          src={editedImage || originalImage?.url}
                          alt="Presentation Media"
                          className="max-h-[640px] w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-sm"
                          referrerPolicy="no-referrer"
                        />
                      </AnimatePresence>
                    </div>
                    {editedImage && originalImage && (
                      <div className="bg-white border-t border-border-subtle px-8 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 bg-brand-gold rounded-full"></div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">BizVisual Pro Series v1.0</span>
                        </div>
                        <button 
                          onClick={() => setEditedImage(null)}
                          className="text-[10px] items-center gap-2 bg-bg-subtle px-3 py-1.5 rounded flex font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <X size={12} /> Discard Fix
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* History Section */}
            {history.length > 0 && (
              <section className="mt-auto border-t border-border-subtle pt-10" ref={historyRef}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                      <History size={16} /> REVISION ARCHIVE
                    </h3>
                  </div>
                  <button 
                    onClick={() => setHistory([])}
                    className="text-[10px] font-bold text-gray-400 hover:text-brand-accent transition-colors tracking-widest uppercase"
                  >
                    Clear Archives
                  </button>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-6 px-2 -mx-2 hide-scrollbar">
                  {history.map((entry) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={entry.id}
                      className="shrink-0 w-40 group cursor-pointer"
                      onClick={() => {
                        setEditedImage(entry.editedUrl);
                        if (entry.originalUrl) setOriginalImage(prev => prev ? { ...prev, url: entry.originalUrl } : null);
                      }}
                    >
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border-2 border-transparent group-hover:border-brand-accent group-hover:shadow-lg transition-all relative">
                        <img 
                          src={entry.editedUrl} 
                          alt="Revision" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-brand-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <CheckCircle2 size={24} className="text-white" />
                        </div>
                      </div>
                      <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-brand-primary/60 truncate italic leading-none">{entry.prompt}</p>
                      <p className="mt-1 text-[9px] font-medium text-gray-400 leading-none">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Global CSS for Hide Scrollbar */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

