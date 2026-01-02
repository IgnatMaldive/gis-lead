
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MapPanel from './components/MapPanel';
import ReportPanel from './components/ReportPanel';
import ChatBot from './components/ChatBot';
import { BusinessLead, SearchState } from './types';
import { scoutLeads } from './geminiService';
import * as dbService from './db';
import { Radar, Target, Map as MapIcon, Layers, ShieldAlert, Database, Key, ExternalLink, Lock } from 'lucide-react';

const App: React.FC = () => {
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [savedLeads, setSavedLeads] = useState<BusinessLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<BusinessLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'report'>('map');
  const [searchParams, setSearchParams] = useState<SearchState>({
    industry: '',
    location: '',
    minRating: 3.5,
    maxRating: 4.5,
    filterChatbot: false,
    filterBooking: false,
    filterSentiment: 'all'
  });

  // Check for API Authorization
  useEffect(() => {
    const checkAuth = async () => {
      const hasKey = process.env.API_KEY && process.env.API_KEY !== 'YOUR_GEMINI_API_KEY_HERE';
      
      // If window.aistudio helper is available, check that too
      let hasAistudioKey = false;
      if ((window as any).aistudio?.hasSelectedApiKey) {
        hasAistudioKey = await (window as any).aistudio.hasSelectedApiKey();
      }

      if (!hasKey && !hasAistudioKey) {
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    };
    checkAuth();
  }, []);

  const handleAuthorize = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setIsAuthorized(true); // Assume success per instructions
    } else {
      alert("Please ensure your API_KEY is correctly set in the .env file.");
    }
  };

  // Initialize DB on mount
  useEffect(() => {
    const init = async () => {
      try {
        await dbService.initDb();
        refreshLeads();
        setDbReady(true);
      } catch (e) {
        console.error("DB Init failed", e);
      }
    };
    init();
  }, []);

  const refreshLeads = useCallback(() => {
    const all = dbService.getAllLeads();
    setLeads(all);
    setSavedLeads(all.filter(l => (l as any).isSaved));
    
    if (selectedLead) {
      const refreshed = dbService.getLeadById(selectedLead.id);
      if (refreshed) setSelectedLead(refreshed);
    }
  }, [selectedLead]);

  const handleSearch = async (params: SearchState) => {
    setLoading(true);
    setSearchParams(params);
    try {
      const results = await scoutLeads(params);
      for (const lead of results) {
        await dbService.upsertLead(lead);
      }
      refreshLeads();
      setSelectedLead(null);
      setViewMode('map');
    } catch (error: any) {
      console.error("Scouting failed:", error);
      if (error.message?.includes("Requested entity was not found")) {
        setIsAuthorized(false);
      } else {
        alert("Error scouting leads. Please check your connection or API key.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = leads.filter(l => l.rating >= searchParams.minRating && l.rating <= searchParams.maxRating);
    if (searchParams.filterChatbot) filtered = filtered.filter(l => l.hasChatbot);
    if (searchParams.filterBooking) filtered = filtered.filter(l => l.hasOnlineBooking);
    if (searchParams.filterSentiment && searchParams.filterSentiment !== 'all') {
      filtered = filtered.filter(l => l.sentiment === searchParams.filterSentiment);
    }
    setFilteredLeads(filtered);
  }, [leads, searchParams]);

  const handleFocusLead = useCallback((lead: BusinessLead) => {
    setSelectedLead(lead);
    setViewMode('map');
  }, []);

  const handleViewReport = useCallback((lead: BusinessLead) => {
    setSelectedLead(lead);
    setViewMode('report');
  }, []);

  const handleToggleSave = useCallback(async (lead: BusinessLead) => {
    await dbService.toggleLeadSave(lead.id);
    refreshLeads();
  }, [refreshLeads]);

  const handleImport = async (file: File) => {
    setLoading(true);
    try {
      await dbService.importDb(file);
      refreshLeads();
    } catch (e) {
      alert("Import failed: Invalid SQLite file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Missing Key Modal Overlay */}
      {!isAuthorized && (
        <div className="absolute inset-0 z-[10000] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-slate-900 border-2 border-violet-500/50 rounded-3xl p-10 max-w-lg w-full shadow-[0_0_50px_rgba(139,92,246,0.3)] animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mb-6 border border-violet-500/30">
                <Lock className="w-10 h-10 text-violet-400 animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold mb-4 tracking-tight">Tactical Link Required</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                The LeadGenius Command Center requires an active API Authorization to establish a connection with the Scouting Matrix. Please authorize your tactical key to continue.
              </p>
              
              <div className="w-full space-y-4">
                <button 
                  onClick={handleAuthorize}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-3 active:scale-95"
                >
                  <Key className="w-5 h-5" />
                  Authorize Tactical Link
                </button>
                
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-xs font-mono text-slate-500 hover:text-indigo-400 transition-colors py-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  API Billing Documentation
                </a>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-800 w-full flex items-center justify-between text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                <span>Status: CONNECTION_LOCKED</span>
                <span>System: v4.1.0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header / HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-700 px-6 py-2 rounded-full pointer-events-auto">
          <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)] ${dbReady ? 'bg-indigo-500' : 'bg-rose-500'}`}></div>
          <span className="font-mono text-sm tracking-widest text-indigo-400 font-bold uppercase">
            {dbReady ? 'Tactical SQL Engine Active' : 'Initializing Core...'}
          </span>
        </div>
        
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-full">
            <Radar className="w-4 h-4 text-violet-400" />
            <span className="font-mono text-xs text-slate-400">Scout Range: Global</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => dbService.exportDb()}
              className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700 p-2 rounded-full transition-all group"
              title="Export Database (.sqlite)"
            >
              <Database className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            </button>
            <label className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700 p-2 rounded-full cursor-pointer transition-all group" title="Import Database (.sqlite)">
              <Layers className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <input type="file" className="hidden" accept=".sqlite,.db" onChange={(e) => e.target.files && handleImport(e.target.files[0])} />
            </label>
          </div>
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
        onViewReport={handleViewReport}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />
      
      <div className="relative flex-1 h-full">
        {viewMode === 'map' ? (
          <MapPanel 
            leads={filteredLeads} 
            savedLeads={savedLeads}
            selectedLead={selectedLead} 
            onMarkerClick={handleFocusLead}
          />
        ) : (
          <ReportPanel 
            lead={selectedLead} 
            onClose={() => setViewMode('map')} 
          />
        )}
        
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
              <div className="font-mono text-indigo-400 animate-pulse text-lg uppercase tracking-widest">
                Scouting Business Matrix...
              </div>
              <div className="text-slate-500 text-xs mt-2 uppercase tracking-widest">Syncing with tactical data streams</div>
            </div>
          </div>
        )}
      </div>

      <ChatBot onIntelligenceUpdate={refreshLeads} />
    </div>
  );
};

export default App;
