'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Code, Type,
  ChevronDown, X, Sparkles
} from 'lucide-react';
import QuestionBuilder from '@/components/cms/QuestionBuilder';

export default function AdvancedQuestionBank() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  const handleSave = (data: any) => {
    console.log("Forensic Neuron Deployed:", data);
    setShowBuilder(false);
    setEditingQuestion(null);
    // Integration: POST to /questions API via TanStack Query
  };

  return (
    <div className="min-h-screen p-8 custom-scrollbar relative">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter neon-text-purple mb-2">
            NEURAL BANK <span className="text-white/20">|</span> REPOSITORY
          </h1>
          <p className="text-gray-400 text-sm font-medium">Manage and refine forensic-grade academic content.</p>
        </div>
        
        <button 
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2 px-8 py-4 bg-neon-purple text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:shadow-[0_0_30px_rgba(188,19,254,0.3)] transition-all"
        >
          <Plus size={18} /> GENERATE NEW NEURON
        </button>
      </header>

      {/* Global Filter Bar */}
      <div className="flex gap-4 mb-12 translate-y-[-20px]">
        <div className="flex-1 glass-card p-2 flex items-center gap-4 border-neon-purple/10 bg-white/[0.02]">
          <Search className="ml-4 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Search neurons by snippet, tag, or topic vector..."
            className="flex-1 bg-transparent border-none outline-none text-sm py-4 font-medium"
          />
        </div>
        <button className="px-8 glass-card flex items-center gap-3 hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest text-gray-400">
           <Filter size={18} /> Filters <ChevronDown size={14} />
        </button>
      </div>

      {/* Neuron Grid View */}
      <div className="grid grid-cols-1 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <motion.div 
            key={i}
            whileHover={{ x: 10 }}
            className="glass-card p-10 group hover:border-neon-purple/30 transition-all flex gap-10 items-center bg-gradient-to-r from-transparent to-white/[0.01]"
          >
             <div className="p-5 bg-neon-purple/10 rounded-3xl text-neon-purple border border-neon-purple/20">
                {i % 2 === 0 ? <Code size={32} /> : <Type size={32} />}
             </div>
             
             <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                   <span className="px-4 py-1 bg-neon-purple/5 border border-neon-purple/10 rounded-full text-[10px] font-black text-neon-purple uppercase">RECURSION</span>
                   <span className="px-4 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase">EASY</span>
                   <div className="h-4 w-[1px] bg-white/10 mx-2" />
                   <span className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1"><Sparkles size={10}/> Weighted Score: 4.8</span>
                </div>
                
                <h3 className="text-2xl font-bold leading-relaxed max-w-3xl">
                   Identify the base case in a Depth First Search (DFS) algorithm when traversing an acyclic graph.
                </h3>
             </div>

             <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => { setEditingQuestion({ id: i, text: '...', type: 'MCQ' }); setShowBuilder(true); }}
                  className="px-10 py-3 rounded-xl bg-white/5 font-black text-[10px] uppercase hover:bg-white/10 tracking-widest border border-white/5"
                >
                  Edit Neuron
                </button>
                <div className="h-10 w-[1px] bg-white/10" />
                <button className="p-3 bg-red-400/10 text-red-500/40 hover:text-red-500 rounded-xl transition-all">
                   <X size={20} />
                </button>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Full-Screen Builder Overlay */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl p-12 custom-scrollbar overflow-y-auto"
          >
            <div className="max-w-6xl mx-auto h-[800px]">
               <QuestionBuilder 
                  onSave={handleSave} 
                  onCancel={() => { setShowBuilder(false); setEditingQuestion(null); }}
                  initialData={editingQuestion}
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
