
import React from 'react';
import { BusinessLead } from '../types';
import { X, FileText, Globe, Star, MapPin, ShieldAlert, Target, MessageSquare, Calendar, Smile, TrendingUp, ArrowLeft, BookOpen, ClipboardCheck } from 'lucide-react';

interface ReportPanelProps {
  lead: BusinessLead | null;
  onClose: () => void;
}

const ReportPanel: React.FC<ReportPanelProps> = ({ lead, onClose }) => {
  if (!lead) return null;

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col p-8 overflow-y-auto animate-in fade-in slide-in-from-right duration-500">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-xs font-mono uppercase tracking-widest mb-6 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Back to Tactical Map
          </button>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white">{lead.name}</h1>
            <div className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-mono font-bold">
              ID: {lead.id.toUpperCase()}
            </div>
          </div>
          <p className="text-slate-400 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {lead.address}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 text-3xl font-bold text-amber-400 mb-1">
            <Star className="w-8 h-8 fill-current" />
            {lead.rating}
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Public Authority Score</span>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Digital Footprint & Intelligence */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Globe className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-bold text-slate-200">Digital Footprint</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">AI Chatbot</span>
                </div>
                {lead.hasChatbot ? 
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/30 uppercase">Detected</span> :
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-400/10 px-2 py-1 rounded border border-rose-400/30 uppercase">Missing</span>
                }
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">Online Booking</span>
                </div>
                {lead.hasOnlineBooking ? 
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/30 uppercase">Active</span> :
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-400/10 px-2 py-1 rounded border border-rose-400/30 uppercase">Inactive</span>
                }
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">Public Sentiment</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${
                  lead.sentiment === 'positive' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' : 
                  lead.sentiment === 'negative' ? 'text-rose-400 bg-rose-400/10 border-rose-400/30' : 
                  'text-slate-400 bg-slate-400/10 border-slate-400/30'
                }`}>
                  {lead.sentiment}
                </span>
              </div>
            </div>
          </div>
          
          {lead.notes && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-slate-200">Intelligence Notes</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                {lead.notes}
              </p>
            </div>
          )}

          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-indigo-300">Growth Opportunity</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed italic">
              "Based on initial scouting, this lead shows a high potential for conversion if pitched on automated customer engagement systems."
            </p>
          </div>
        </div>

        {/* Center/Right Column - Core Intelligence */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="font-bold text-slate-200">Identified Gaps & Vulnerabilities</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lead.marketGaps.map((gap, i) => (
                <div key={i} className="flex items-start gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800/50">
                  <div className="w-8 h-8 flex-shrink-0 bg-rose-500/5 text-rose-500 border border-rose-500/20 rounded-full flex items-center justify-center font-mono text-xs font-bold">
                    0{i+1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-300 text-sm mb-1 uppercase tracking-tight">{gap}</h4>
                    <p className="text-xs text-slate-500">Structural digital deficit identified during scanner sweep.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-violet-600/10 border border-violet-500/20 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <Target className="w-32 h-32" />
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-violet-500/10 rounded-lg">
                <Target className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="font-bold text-slate-200">Tactical Sales Pitch</h3>
            </div>
            
            <div className="bg-slate-950/80 backdrop-blur-sm border border-violet-500/30 p-8 rounded-2xl">
              <p className="text-lg text-violet-100 leading-relaxed font-medium italic">
                "{lead.pitchAngle}"
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Strategy Type</div>
                  <div className="text-xs font-bold text-slate-300">Modernization & Authority Loop</div>
                </div>
              </div>
            </div>
          </div>

          {lead.proposal && (
            <div className="bg-emerald-600/5 border border-emerald-500/20 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <ClipboardCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-bold text-slate-200">AI Generated Proposal</h3>
              </div>
              <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-2xl font-sans text-sm text-slate-300 leading-relaxed whitespace-pre-line prose prose-invert">
                {lead.proposal}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-12 text-center text-[10px] font-mono text-slate-600 uppercase tracking-[0.3em]">
        Intelligence Report Generated by LeadGenius AI Scouting Engine // Confidential Data
      </div>
    </div>
  );
};

export default ReportPanel;
