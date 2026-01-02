
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MapPanel from './components/MapPanel';
import ChatBot from './components/ChatBot';
import { BusinessLead, SearchState } from './types';
import { scoutLeads } from './geminiService';
import { Radar, Target, Map as MapIcon, Layers, ShieldAlert } from 'lucide-react';

const App: React.FC = () => {
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [savedLeads, setSavedLeads] = useState<BusinessLead[]>(() => {
    const saved = localStorage.getItem('leadgenius_saved_leads');
    return saved ? JSON.parse(saved) : [];
  });
  const [filteredLeads, setFilteredLeads] = useState<BusinessLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null);
  const [searchParams, setSearchParams] = useState<SearchState>({
    industry: '',
    location: '',
    minRating: 3.5,
    maxRating: 4.5,
    filterChatbot: false,
    filterBooking: false,
    filterSentiment: 'all'
  });

  useEffect(() => {
    localStorage.setItem('leadgenius_saved_leads', JSON.stringify(savedLeads));
  }, [savedLeads]);

  const handleSearch = async (params: SearchState) => {
    setLoading(true);
    setSearchParams(params);
    try {
      const results = await scoutLeads(params);
      setLeads(results);
      setSelectedLead(null);
    } catch (error) {
      console.error("Scouting failed:", error);
      alert("Error scouting leads. Please check your connection or API key.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = leads.filter(l => l.rating >= searchParams.minRating && l.rating <= searchParams.maxRating);
    
    if (searchParams.filterChatbot) {
      filtered = filtered.filter(l => l.hasChatbot);
    }
    if (searchParams.filterBooking) {
      filtered = filtered.filter(l => l.hasOnlineBooking);
    }
    if (searchParams.filterSentiment && searchParams.filterSentiment !== 'all') {
      filtered = filtered.filter(l => l.sentiment === searchParams.filterSentiment);
    }

    setFilteredLeads(filtered);
  }, [leads, searchParams]);

  const handleFocusLead = useCallback((lead: BusinessLead) => {
    setSelectedLead(lead);
  }, []);

  const handleToggleSave = useCallback((lead: BusinessLead) => {
    setSavedLeads(prev => {
      const isAlreadySaved = prev.some(l => l.id === lead.id);
      if (isAlreadySaved) {
        return prev.filter(l => l.id !== lead.id);
      } else {
        return [...prev, lead];
      }
    });
  }, []);

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header / HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-700 px-6 py-2 rounded-full pointer-events-auto">
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
          <span className="font-mono text-sm tracking-widest text-indigo-400 font-bold uppercase">Tactical System Active</span>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-full pointer-events-auto">
          <Radar className="w-4 h-4 text-violet-400" />
          <span className="font-mono text-xs text-slate-400">Scout Range: Global</span>
        </div>
      </div>

      {/* Main Layout */}
      <Sidebar 
        onSearch={handleSearch} 
        leads={filteredLeads} 
        savedLeads={savedLeads}
        onToggleSave={handleToggleSave}
        loading={loading}
        onFocusLead={handleFocusLead}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />
      
      <div className="relative flex-1 h-full">
        <MapPanel 
          leads={filteredLeads} 
          savedLeads={savedLeads}
          selectedLead={selectedLead} 
          onMarkerClick={handleFocusLead}
        />
        
        {/* Map UI Overlays */}
        {leads.length === 0 && savedLeads.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px] pointer-events-none">
            <div className="bg-slate-900/90 border border-slate-700 p-8 rounded-2xl max-w-md text-center shadow-2xl animate-in fade-in zoom-in">
              <div className="bg-indigo-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/50">
                <Target className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Ready to Scout</h2>
              <p className="text-slate-400 mb-6">Enter an industry and location in the control panel to begin scanning for market opportunities.</p>
              <div className="flex justify-center gap-4 text-xs font-mono text-slate-500">
                <div className="flex items-center gap-1"><MapIcon className="w-3 h-3" /> MAP_SCAN</div>
                <div className="flex items-center gap-1"><Layers className="w-3 h-3" /> ANALYZE_GAP</div>
                <div className="flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> IDENTIFY_RISK</div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm z-50">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-4 border-2 border-violet-500/20 rounded-full animate-pulse"></div>
              </div>
              <div className="font-mono text-indigo-400 animate-pulse text-lg">SCOUTING & VERIFYING...</div>
              <div className="text-slate-500 text-xs mt-2 uppercase tracking-widest">Scanning local business grid</div>
            </div>
          </div>
        )}
      </div>

      <ChatBot />
    </div>
  );
};

export default App;
