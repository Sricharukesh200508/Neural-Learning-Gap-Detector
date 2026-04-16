'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Users, AlertCircle, TrendingUp, Mic, 
  Mail, MessageSquare, Video, Shield, ChevronRight,
  Brain, BarChart3, Database, Sparkles, LayoutGrid
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import 'echarts-gl';

// Mock data for 2026 aesthetics
const STUDENTS = [
  { id: 1, name: 'Alex Rivera', status: 'Engaged', risk: 'Low', gap: 'Linked Lists' },
  { id: 2, name: 'Sarah Chen', status: 'Disengaged', risk: 'High', gap: 'Recursion' },
  { id: 3, name: 'Marcus Jin', status: 'At Risk', risk: 'Medium', gap: 'Binary Trees' },
  { id: 4, name: 'Elena Vance', status: 'Engaged', risk: 'Low', gap: 'None' },
];

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isListening, setIsListening] = useState(false);

  // ECharts Heatmap Configuration (3D Placeholder)
  const heatmapOption = {
    backgroundColor: 'transparent',
    tooltip: {},
    visualMap: {
      max: 100,
      inRange: {
        color: ['#3b82f6', '#00f2ff', '#bc13fe', '#ff0055']
      },
      show: false
    },
    xAxis3D: { type: 'category', data: ['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4', 'Topic 5'] },
    yAxis3D: { type: 'category', data: ['Std A', 'Std B', 'Std C', 'Std D', 'Std E'] },
    zAxis3D: { type: 'value' },
    grid3D: {
      boxWidth: 200,
      boxDepth: 80,
      viewControl: { projection: 'perspective' },
      light: { main: { intensity: 1.2 }, ambient: { intensity: 0.3 } }
    },
    series: [{
      type: 'bar3D',
      data: [
        [0, 0, 85], [1, 0, 40], [2, 0, 90], [3, 0, 75], [4, 0, 60],
        [0, 1, 30], [1, 1, 95], [2, 1, 20], [3, 1, 55], [4, 1, 80],
      ].map(item => ({ value: item, itemStyle: { opacity: 0.8 } })),
      shading: 'lambert',
      label: { show: false }
    }]
  };

  return (
    <div className="min-h-screen p-8 flex flex-col gap-8 custom-scrollbar">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter neon-text-blue">
            AI CO-PILOT <span className="text-white/20">|</span> TEACHER NODE
          </h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Industry 2026 EdTech Standard • Real-time Multimodal Fusion</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setIsListening(!isListening)}
            className={`p-4 rounded-full glass-card transition-all duration-500 flex items-center gap-3 ${isListening ? 'border-neon-purple text-neon-purple shadow-[0_0_20px_rgba(188,19,254,0.3)]' : 'hover:border-neon-blue text-gray-400'}`}
          >
            <Mic className={isListening ? 'animate-pulse' : ''} size={20} />
            {isListening && <span className="text-xs font-bold uppercase tracking-widest">Listening...</span>}
          </button>
          
          <div className="p-1 glass-card flex gap-1">
            {['overview', 'proctoring', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex gap-8 flex-1 overflow-hidden">
        {/* Forensic Side-Nav */}
        <aside className="w-20 glass-card bg-black/40 border-white/5 flex flex-col items-center py-8 gap-10">
           <div className="w-12 h-12 rounded-2xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue">
              <Activity size={24} />
           </div>
           
           <nav className="flex flex-col gap-8">
              <a href="/teacher" title="Analytics Hub" className="text-neon-blue hover:scale-110 transition-all"><BarChart3 size={20} /></a>
              <a href="/teacher/subjects" title="Subject CMS" className="text-gray-500 hover:text-white transition-all"><Database size={20} /></a>
              <a href="/teacher/questions" title="Question Bank" className="text-gray-500 hover:text-white transition-all"><Brain size={20} /></a>
              <a href="/teacher/quizzes/editor" title="Quiz Architect" className="text-gray-500 hover:text-white transition-all"><Sparkles size={20} /></a>
           </nav>

           <div className="mt-auto">
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-black hover:bg-white/5 cursor-pointer">TN</div>
           </div>
        </aside>

        <main className="grid grid-cols-12 gap-8 flex-1 overflow-y-auto custom-scrollbar pr-4">
        {/* Left Column: 3D Heatmap & Live Feed */}
        <div className="col-span-8 flex flex-col gap-8">
          <div className="flex-1 glass-card p-6 relative group overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 font-bold text-gray-400 uppercase tracking-tighter text-sm">
                <BarChart3 size={16} className="text-neon-blue" /> Multimodal Engagement Heatmap 2.0
              </h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-neon-blue/10 text-neon-blue rounded-full text-[10px] font-bold border border-neon-blue/20">LIVE TELEMETRY</span>
                <span className="px-3 py-1 bg-white/5 text-gray-400 rounded-full text-[10px] font-bold">TOPICS x STUDENTS</span>
              </div>
            </div>
            
            <div className="h-[400px] w-full">
               <ReactECharts 
                 option={heatmapOption} 
                 style={{ height: '100%', width: '100%' }}
                 notMerge={true}
                 lazyUpdate={true}
               />
            </div>
            
            <div className="absolute bottom-6 left-6 right-6 p-4 glass-card bg-black/40 flex justify-between items-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
               <p className="text-xs text-gray-300">Observation: <span className="text-neon-blue font-bold">Class disengagement detected at Topic 4</span> (Recursion depth).</p>
               <button className="text-[10px] font-black uppercase text-neon-purple border border-neon-purple/30 px-4 py-2 rounded-lg hover:bg-neon-purple hover:text-white transition-all">GENERATE REMEDIAL</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="glass-card p-6 border-l-4 border-neon-purple">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-neon-purple/10 rounded-2xl text-neon-purple">
                  <Brain size={24} />
                </div>
                <TrendingUp size={16} className="text-neon-purple" />
              </div>
              <h4 className="font-bold text-xl mb-1">Predictive Intervention</h4>
              <p className="text-xs text-gray-400">Next 48h Failure Risk: <span className="text-neon-purple font-bold">12%</span></p>
              <div className="mt-4 flex flex-col gap-2">
                <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
                  <span className="text-[10px] font-bold text-gray-300">Send Micro-Remedial to Gap Cluster A</span>
                  <ChevronRight size={14} className="text-gray-500 group-hover:text-white transition-all" />
                </div>
              </div>
            </div>
            
            <div className="glass-card p-6 border-l-4 border-neon-blue">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-neon-blue/10 rounded-2xl text-neon-blue">
                  <Shield size={24} />
                </div>
                <AlertCircle size={16} className="text-neon-blue" />
              </div>
              <h4 className="font-bold text-xl mb-1">Anomaly Clusters</h4>
              <p className="text-xs text-gray-400">Identified via <span className="text-neon-blue font-bold">pgvector</span> mapping</p>
              <div className="mt-4 flex gap-2">
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-gray-400">High Accuracy/Low Engagement</span>
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-gray-400">Boredom Detected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Roster & Timeline */}
        <div className="col-span-4 flex flex-col gap-8">
          <div className="glass-card flex-1 p-6 flex flex-col">
            <h3 className="flex items-center gap-2 font-bold text-gray-400 uppercase tracking-tighter text-sm mb-6">
              <Users size={16} className="text-neon-blue" /> Student Real-time Node
            </h3>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {STUDENTS.map((s) => (
                <motion.div 
                  key={s.id}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 cursor-pointer hover:border-white/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold">
                      {s.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-bold">{s.name}</h4>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                        s.risk === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                      }`}>{s.risk} Risk</span>
                    </div>
                    <p className="text-[10px] text-gray-500">Gap: <span className="text-blue-400">{s.gap}</span></p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <button className="w-full mt-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
              <Activity size={16} /> BROADCAST REMEDIAL
            </button>
          </div>

          <div className="glass-card p-6 flex flex-col gap-6 border-neon-blue/20 bg-gradient-to-br from-neon-blue/5 to-transparent">
            <div className="flex justify-between items-center">
               <h3 className="text-xs font-black text-neon-blue uppercase tracking-[0.2em] flex items-center gap-2">
                  <Database size={16} /> CONTENT DEPLOYMENT HUB
               </h3>
               <span className="px-3 py-1 bg-neon-blue text-black text-[8px] font-black rounded-full shadow-lg shadow-neon-blue/20">LIVE CLOUD SYNC</span>
            </div>

            <div className="space-y-4">
               {[
                 { title: 'Data Structures Mid-Term', status: 'DEPLOYED', date: '2h ago' },
                 { title: 'Recursion Depth Test', status: 'DRAFT', date: '5m ago' }
               ].map((item) => (
                  <div key={item.title} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-neon-blue/40 transition-all group flex items-center justify-between">
                     <div>
                        <h4 className="text-sm font-bold text-gray-200">{item.title}</h4>
                        <div className="flex gap-3 mt-1 text-[9px] font-bold text-gray-400">
                           <span>{item.date}</span>
                           <span className={item.status === 'DEPLOYED' ? 'text-green-500' : 'text-yellow-500'}>{item.status}</span>
                        </div>
                     </div>
                     <ChevronRight size={14} className="text-gray-600 group-hover:text-white transition-all" />
                  </div>
               ))}
            </div>
            <a href="/teacher/quizzes/editor" className="w-full py-3 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase text-center rounded-xl border border-white/5 transition-all">
               OPEN FULL ARCHITECT
            </a>
          </div>

          <div className="glass-card p-6 h-[200px]">
            <h3 className="flex items-center gap-2 font-bold text-gray-400 uppercase tracking-tighter text-sm mb-4">
              <Database size={16} className="text-neon-purple" /> System Heartbeat
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">MEDIA-PIPE STREAM</span>
                <span className="text-green-400 font-bold">STABLE 60FPS</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  className="h-full bg-neon-blue"
                />
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">D.K.T. INFERENCE</span>
                <span className="text-neon-purple font-bold">LATENCY: 12ms</span>
              </div>
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}
