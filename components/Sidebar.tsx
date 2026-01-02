
import React, { useState } from 'react';
import { SearchState, BusinessLead } from '../types';
import { Search, MapPin, Filter, Star, Zap, Eye, CheckCircle2, Bookmark, History, MessageSquare, Calendar, Smile } from 'lucide-react';
import BusinessCard from './BusinessCard';

interface SidebarProps {
  onSearch: (params: SearchState) => void;
  leads: BusinessLead[];
  savedLeads: BusinessLead[];
  onToggleSave: (lead: BusinessLead) => void;
  loading: boolean;
  onFocusLead: (lead: BusinessLead) => void;
  searchParams: SearchState;
  setSearchParams: (params: SearchState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onSearch, 
  leads, 
  savedLeads,
  onToggleSave,
  loading, 
  onFocusLead, 
  searchParams, 
  setSearchParams 
}) => {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [view, setView] = useState<'search' | 'saved'>('search');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry || !location) return;
    setView('search');
    onSearch({ ...searchParams, industry, location });
  };

  const currentLeads = view === 'search' ? leads : savedLeads;

  return (
    <div className="w-[420px] bg-slate-900 border-r border-slate-800 flex flex-col h-full shadow-2xl z-20">
      {/* Search Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            < Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">LeadGenius <span className="text-indigo-400">Maps</span></h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Tactical Command Center</p>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Industry (e.g., Dentist, Roofer)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <MapPin className="w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Location (City, State)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Initialize Scout</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-indigo-400 transition-colors uppercase tracking-wider"
          >
            <Filter className="w-3 h-3" />
            {showFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
          </button>

          {showFilters && (
            <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Min Rating</span>
                  <span className="text-[10px] font-mono text-indigo-400">{searchParams.minRating} ★</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={searchParams.minRating}
                    onChange={(e) => setSearchParams({...searchParams, minRating: parseFloat(e.target.value)})}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setSearchParams({...searchParams, filterChatbot: !searchParams.filterChatbot})}
                  className={`flex items-center justify-center gap-2 p-2 rounded-lg border text-[10px] font-mono transition-all ${searchParams.filterChatbot ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                >
                  <MessageSquare className="w-3 h-3" /> CHATBOT
                </button>
                <button 
                  onClick={() => setSearchParams({...searchParams, filterBooking: !searchParams.filterBooking})}
                  className={`flex items-center justify-center gap-2 p-2 rounded-lg border text-[10px] font-mono transition-all ${searchParams.filterBooking ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                >
                  <Calendar className="w-3 h-3" /> BOOKING
                </button>
              </div>

              <div className="space-y-2">
                 <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Sentiment Profile</span>
                 <div className="flex gap-1">
                   {['all', 'positive', 'neutral', 'negative'].map((s) => (
                     <button
                        key={s}
                        onClick={() => setSearchParams({...searchParams, filterSentiment: s as any})}
                        className={`flex-1 py-1.5 rounded-md border text-[9px] font-mono uppercase transition-all ${searchParams.filterSentiment === s ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                     >
                       {s}
                     </button>
                   ))}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Selector Tabs */}
      <div className="flex border-b border-slate-800">
        <button 
          onClick={() => setView('search')}
          className={`flex-1 py-3 text-[10px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors ${view === 'search' ? 'text-indigo-400 bg-indigo-500/5 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <History className="w-3 h-3" /> Active Targets
        </button>
        <button 
          onClick={() => setView('saved')}
          className={`flex-1 py-3 text-[10px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors ${view === 'saved' ? 'text-violet-400 bg-violet-500/5 border-b-2 border-violet-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Bookmark className="w-3 h-3" /> Saved Archive ({savedLeads.length})
        </button>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentLeads.length > 0 ? (
          <>
            <div className="flex items-center justify-between px-2 mb-2">
              <h2 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                {view === 'search' ? 'Identified Targets' : 'Saved Intelligence'} ({currentLeads.length})
              </h2>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED
              </div>
            </div>
            {currentLeads.map((lead) => (
              <BusinessCard 
                key={lead.id} 
                lead={lead} 
                onFocus={onFocusLead} 
                isSaved={savedLeads.some(sl => sl.id === lead.id)}
                onToggleSave={onToggleSave}
              />
            ))}
          </>
        ) : !loading && (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 px-8 text-center py-20">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700">
              <Eye className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-sm">
              {view === 'search' 
                ? "No targets matching current tactical filters." 
                : "Your intelligence archive is empty. Scout and save leads to see them here."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
