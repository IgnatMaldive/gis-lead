
import React, { useState } from 'react';
import { BusinessLead, CompetitorReport } from '../types';
import { Star, MapPin, Globe, ShieldAlert, Target, Sparkles, ChevronRight, Bookmark, BookmarkCheck, BarChart3, Loader2, X, AlertTriangle } from 'lucide-react';
import { analyzeCompetitor } from '../geminiService';

interface BusinessCardProps {
  lead: BusinessLead;
  onFocus: (lead: BusinessLead) => void;
  isSaved?: boolean;
  onToggleSave?: (lead: BusinessLead) => void;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ lead, onFocus, isSaved, onToggleSave }) => {
  const [showCompetitorInput, setShowCompetitorInput] = useState(false);
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [report, setReport] = useState<CompetitorReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-emerald-400';
    if (rating >= 3.5) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getRatingBg = (rating: number) => {
    if (rating >= 4.5) return 'bg-emerald-500/10 border-emerald-500/30';
    if (rating >= 3.5) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-rose-500/10 border-rose-500/30';
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave?.(lead);
  };

  const handleAnalyzeCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitorUrl.trim()) return;
    setIsAnalyzing(true);
    try {
      const data = await analyzeCompetitor(lead, competitorUrl);
      setReport(data);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze competitor.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div 
      onClick={() => onFocus(lead)}
      className={`group relative bg-slate-800/40 border rounded-2xl p-5 hover:bg-slate-800/80 transition-all cursor-pointer overflow-hidden ${isSaved ? 'border-violet-500/40 bg-violet-500/5' : 'border-slate-700/50 hover:border-indigo-500/50'}`}
    >
      {/* Glowing accent on hover */}
      <div className={`absolute top-0 left-0 w-1 h-full transition-opacity ${isSaved ? 'bg-violet-600 opacity-100' : 'bg-indigo-600 opacity-0 group-hover:opacity-100'}`}></div>
      
      <div className="flex justify-between items-start mb-3">
        <h3 className={`font-bold transition-colors line-clamp-1 flex-1 pr-2 ${isSaved ? 'text-violet-300' : 'text-slate-100 group-hover:text-indigo-400'}`}>
          {lead.name}
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleToggleSave}
            className={`p-1.5 rounded-lg transition-all ${isSaved ? 'text-violet-400 bg-violet-400/10' : 'text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10'}`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
          </button>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border ${getRatingBg(lead.rating)} ${getRatingColor(lead.rating)}`}>
            <Star className="w-3 h-3 fill-current" />
            {lead.rating}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-mono">
        <MapPin className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{lead.address}</span>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 mb-2">
          {lead.hasChatbot && <span className="text-[8px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded-md font-mono">CHATBOT_ON</span>}
          {lead.hasOnlineBooking && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-md font-mono">BOOKING_ON</span>}
          <span className={`text-[8px] border px-1.5 py-0.5 rounded-md font-mono ${lead.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : lead.sentiment === 'negative' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
            SENTIMENT: {lead.sentiment.toUpperCase()}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 uppercase tracking-tighter">
            <ShieldAlert className="w-3 h-3" /> MARKET GAPS IDENTIFIED
          </div>
          <div className="flex flex-wrap gap-2">
            {lead.marketGaps.map((gap, i) => (
              <span key={i} className="text-[10px] bg-rose-500/5 border border-rose-500/20 text-slate-300 px-2 py-0.5 rounded uppercase">
                {gap}
              </span>
            ))}
          </div>
        </div>

        <div className={`border rounded-xl p-3 transition-colors ${isSaved ? 'bg-violet-950/20 border-violet-500/20' : 'bg-indigo-950/30 border-indigo-500/20'}`}>
          <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter mb-1 ${isSaved ? 'text-violet-400' : 'text-indigo-400'}`}>
            <Target className="w-3 h-3" /> TACTICAL PITCH
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-2">
            "{lead.pitchAngle}"
          </p>
        </div>
      </div>

      {/* Competitor Analysis Section */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        {!showCompetitorInput && !report && (
          <button 
            onClick={(e) => { e.stopPropagation(); setShowCompetitorInput(true); }}
            className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-500 hover:text-indigo-400 transition-colors uppercase"
          >
            <BarChart3 className="w-3 h-3" /> Analyze Competitor
          </button>
        )}

        {showCompetitorInput && !report && (
          <form onSubmit={handleAnalyzeCompetitor} onClick={(e) => e.stopPropagation()} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Competitor URL..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              value={competitorUrl}
              onChange={(e) => setCompetitorUrl(e.target.value)}
              disabled={isAnalyzing}
            />
            <button 
              type="submit" 
              disabled={isAnalyzing || !competitorUrl.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Scout'}
            </button>
            <button 
              onClick={() => setShowCompetitorInput(false)}
              className="text-slate-500 hover:text-rose-400"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        )}

        {report && (
          <div className="bg-slate-900/50 border border-indigo-500/30 rounded-xl p-3 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Competitor Report</span>
              <button onClick={(e) => { e.stopPropagation(); setReport(null); }} className="text-slate-600 hover:text-rose-400 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="space-y-1">
                <span className="text-[8px] text-slate-500 font-mono">DETECTED_ISSUES</span>
                <div className="flex flex-wrap gap-1">
                  {report.issues.map((issue, idx) => (
                    <span key={idx} className="text-[9px] bg-rose-500/10 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/20">{issue}</span>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight border-l border-indigo-500/30 pl-2">
                {report.comparisonSummary}
              </p>
              <div className="flex items-center gap-2 bg-emerald-500/5 p-1.5 rounded border border-emerald-500/20">
                <AlertTriangle className="w-3 h-3 text-emerald-400" />
                <span className="text-[9px] text-emerald-300 font-bold uppercase tracking-tight">{report.advantageLead}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button className={`flex items-center gap-1.5 text-[10px] font-mono font-bold transition-colors ${isSaved ? 'text-violet-400 hover:text-violet-300' : 'text-indigo-400 hover:text-indigo-300'}`}>
          <Sparkles className="w-3 h-3" /> FLY_TO_COORDS
        </button>
        <div className="flex gap-3">
          {lead.website && (
            <a 
              href={lead.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="w-3.5 h-3.5" />
            </a>
          )}
          <button className={`p-1.5 rounded-lg transition-colors ${isSaved ? 'bg-violet-600 hover:bg-violet-500' : 'bg-indigo-600 hover:bg-indigo-500'} text-white`}>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
