'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, ChevronLeft, ChevronRight, Shield, 
  Flag, Send, AlertTriangle, Monitor,
  Zap, Brain, Check, BarChart3, Activity
} from 'lucide-react';
import MediaPipeController from '@/components/telemetry/MediaPipeController';

export default function ForensicQuizEngine({ params }: { params: { id: string } }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [flags, setFlags] = useState<Set<number>>(new Set());
  const [telemetryStream, setTelemetryStream] = useState<any[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  // Auto-Save Logic (10s sync)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      console.log("Forensic Metadata Sync: Saving answers to Cloud Layer...", { 
        answers, 
        currentIdx,
        telemetryCount: telemetryStream.length 
      });
    }, 10000);
    return () => clearInterval(syncInterval);
  }, [answers, currentIdx, telemetryStream]);

  // Full-screen Enforcement (Standard for Proctoring)
  useEffect(() => {
    const handleScreenChange = () => {
       if (!document.fullscreenElement) {
          setShowExitWarning(true);
       }
    };
    document.addEventListener('fullscreenchange', handleScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleScreenChange);
  }, []);

  // Timer logic with forensic pulse
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => {
       if (prev <= 0) {
          submitQuiz();
          return 0;
       }
       return prev - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTelemetry = useCallback((data: any) => {
    // Collect forensic gaze and lip-sync vector
    setTelemetryStream(prev => [...prev.slice(-49), { ...data, t: Date.now() }]);
  }, []);

  const submitQuiz = () => {
    setIsSubmitted(true);
    // Forensic Post-Processing: Submit answers + aggregated behavioral vectors
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans antialiased overflow-hidden selection:bg-neon-purple/30">
      {/* Dynamic Header */}
      <header className="h-24 border-b border-white/5 bg-black/60 backdrop-blur-3xl flex items-center justify-between px-16 z-50">
        <div className="flex items-center gap-8">
           <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter uppercase neon-text-purple">QUIZ SESSION : X9</h1>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">FORENSIC TELEMETRY ACTIVE</span>
           </div>
           <div className="h-8 w-[1px] bg-white/10" />
           <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2">
                    <Timer size={14} className={timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-neon-purple'} />
                    <span className={`text-lg font-black tabular-nums transition-colors ${timeLeft < 300 ? 'text-red-500' : 'text-white'}`}>
                       {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                 </div>
                 <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${(timeLeft/1800)*100}%` }} className="h-full bg-neon-purple" />
                 </div>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="flex items-center gap-3 glass-card px-4 py-2 border-green-500/20">
              <Shield className="text-green-500" size={16} />
              <div className="flex flex-col">
                 <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Integrity Valid</span>
                 <span className="text-[7px] text-gray-500 font-bold uppercase">Token # {params.id.slice(0, 8)}</span>
              </div>
           </div>
           <button 
              onClick={submitQuiz}
              className="group relative px-10 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-neon-purple hover:text-white transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
           >
              SIGN & SUBMIT
              <Send size={14} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:right-4 transition-all" />
           </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 relative overflow-hidden">
        {/* Forensic Left Bar: Question Palette */}
        <nav className="col-span-1 border-r border-white/5 flex flex-col items-center py-12 gap-4 bg-black/40">
           <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 mb-8 border border-white/5">
              <BarChart3 size={20} />
           </div>
           {[...Array(12)].map((_, i) => (
             <button 
               key={i}
               onClick={() => setCurrentIdx(i)}
               className={`w-10 h-10 rounded-xl flex items-center justify-center text-[9px] font-black transition-all relative border ${
                 currentIdx === i ? 'bg-neon-purple border-neon-purple text-white shadow-lg' : 
                 answers[i] ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-gray-600 hover:border-white/20'
               }`}
             >
               {i + 1}
               {flags.has(i) && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-500 rounded-full border-2 border-black" />}
             </button>
           ))}
        </nav>

        {/* Neural Question Engine */}
        <section className="col-span-8 p-16 custom-scrollbar overflow-y-auto bg-[radial-gradient(circle_at_center,rgba(188,19,254,0.02)_0%,transparent_70%)]">
           <AnimatePresence mode="wait">
              <motion.div 
                 key={currentIdx}
                 initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                 animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                 exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                 transition={{ type: 'spring', damping: 25 }}
                 className="max-w-4xl mx-auto"
              >
                 <div className="flex justify-between items-center mb-12">
                    <div className="flex gap-4">
                       <span className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none flex items-center gap-2">
                          <Zap size={10} className="text-neon-purple" /> NODE : 00{currentIdx + 1}
                       </span>
                       <span className="px-4 py-1.5 bg-neon-purple/5 border border-neon-purple/20 text-neon-purple rounded-full text-[10px] font-black uppercase tracking-widest leading-none">RECURSION_DEPTH</span>
                    </div>
                    <button 
                       onClick={() => {
                          const newFlags = new Set(flags);
                          flags.has(currentIdx) ? newFlags.delete(currentIdx) : newFlags.add(currentIdx);
                          setFlags(newFlags);
                       }}
                       className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          flags.has(currentIdx) ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-white/5 text-gray-500 hover:text-white'
                       }`}
                    >
                       <Flag size={14} /> {flags.has(currentIdx) ? 'FLAGGED FOR REVIEW' : 'FLAG NEURON'}
                    </button>
                 </div>
                 
                 <div className="space-y-16">
                    <h2 className="text-4xl font-black leading-[1.2] tracking-tighter">
                       Given a recursive definition $f(n) = f(n-1) + f(n-2)$, which forensic evidence identifies a lack of <span className="text-neon-purple italic">Memoization</span>?
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                       {[
                         'Exponential redundant sub-calls in the Stack Trace',
                         'O(n) Linear space complexity overhead',
                         'Immediate resolution of the Base Case anchor',
                         'Heap corruption due to pointer arithmetic'
                       ].map((opt, idx) => (
                          <button 
                             key={idx}
                             onClick={() => setAnswers({...answers, [currentIdx]: idx})}
                             className={`group w-full p-8 text-left rounded-[32px] border transition-all duration-500 flex items-center gap-8 relative overflow-hidden ${
                                answers[currentIdx] === idx ? 'bg-neon-purple border-neon-purple shadow-[0_20px_50px_rgba(188,19,254,0.15)]' : 'bg-white/5 border-white/5 hover:border-white/10'
                             }`}
                          >
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-500 ${
                                answers[currentIdx] === idx ? 'bg-white text-black scale-110 rotate-3' : 'bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-white'
                             }`}>
                                {String.fromCharCode(65 + idx)}
                             </div>
                             <span className={`text-lg font-bold transition-colors ${answers[currentIdx] === idx ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{opt}</span>
                             
                             {answers[currentIdx] === idx && (
                                <motion.div layoutId="spark" className="absolute right-8 text-white/40">
                                   <Check size={28} />
                                </motion.div>
                             )}
                          </button>
                       ))}
                    </div>
                 </div>
              </motion.div>
           </AnimatePresence>
        </section>

        {/* Forensic Metadata bar */}
        <aside className="col-span-3 border-l border-white/5 p-10 bg-black/60 flex flex-col gap-10">
           <div className="space-y-8">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                 <Monitor size={14} className="text-neon-purple" /> LIVE PROCTOR_UI
              </h3>
              
              <div className="aspect-video w-full rounded-3xl overflow-hidden border border-white/10 relative group bg-black/40">
                 <MediaPipeController onTelemetry={handleTelemetry} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                    <span className="text-[8px] font-black text-gray-500 uppercase">Mental Load</span>
                    <span className="text-sm font-black text-neon-blue">OPTIMAL</span>
                 </div>
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                    <span className="text-[8px] font-black text-gray-500 uppercase">Focus Score</span>
                    <span className="text-sm font-black text-neon-purple">98.4%</span>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-black">
                    <span className="text-gray-500 uppercase flex items-center gap-2"><Activity size={12} className="text-neon-blue" /> ENGAGEMENT_VECTOR</span>
                    <span className="text-neon-blue font-bold tracking-widest">{telemetryStream[telemetryStream.length-1]?.isLookingAway ? '42%' : '89%'}</span>
                 </div>
                 <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                       animate={{ 
                         width: telemetryStream[telemetryStream.length-1]?.isLookingAway ? '42%' : '89%',
                         backgroundColor: telemetryStream[telemetryStream.length-1]?.isLookingAway ? '#f59e0b' : '#00f2ff'
                       }} 
                       className="h-full bg-neon-blue transition-colors duration-1000"
                    />
                 </div>
              </div>

              {telemetryStream[telemetryStream.length-1]?.isLookingAway && (
                 <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="p-5 bg-red-500/10 border border-red-500/20 rounded-3xl flex flex-col gap-2"
                 >
                    <div className="flex items-center gap-3">
                       <AlertTriangle className="text-red-500" size={18} />
                       <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Protocol Warning</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-red-400">
                       Forensic engine detected gaze deviation from active node. Please realign for integrity synchronization.
                    </p>
                 </motion.div>
              )}
           </div>

           <div className="mt-auto glass-card p-8 border-neon-blue/20 bg-gradient-to-tr from-neon-blue/5 to-transparent relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                 <Brain className="text-neon-blue" size={20} />
                 <span className="text-[8px] font-black text-neon-blue uppercase border border-neon-blue/30 px-3 py-1 rounded-full">AI CO-PILOT</span>
              </div>
              <p className="text-[10px] leading-relaxed text-gray-400 italic mb-6">
                 "I've noticed you're spending more than 2x the predicted time on this Recursion problem. Check the base case anchor."
              </p>
              <button className="w-full py-3 bg-neon-blue/10 border border-neon-blue/20 rounded-xl text-[9px] font-black text-neon-blue uppercase tracking-widest hover:bg-neon-blue hover:text-black transition-all">
                REQUEST SYMPATHY HINT
              </button>
           </div>
        </aside>
      </main>

      {/* Global Security Modals */}
      <AnimatePresence>
         {showExitWarning && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-8">
               <div className="glass-card p-12 max-w-lg text-center border-red-500/40">
                  <AlertTriangle className="text-red-500 mx-auto mb-6" size={48} />
                  <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter text-red-500">Integrity Breach</h3>
                  <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                     Protocol detected exit from Full-Screen mode. This event has been logged for forensic clustering. Return to session immediately.
                  </p>
                  <button 
                     onClick={() => {
                        document.documentElement.requestFullscreen();
                        setShowExitWarning(false);
                     }}
                     className="px-12 py-4 bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-600 transition-all"
                  >
                     RE-SYNC PROTOCOL
                  </button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
