
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Minimize2, Maximize2, Terminal } from 'lucide-react';
import { chatWithGenius } from '../geminiService';
import { ChatMessage } from '../types';
import * as db from '../db';

interface ChatBotProps {
  onIntelligenceUpdate?: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ onIntelligenceUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Tactical strategist online. I can manage the lead database, write proposals, and store intelligence notes for any target.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Step 1: Send to Gemini
      let response = await chatWithGenius(messages, userMessage);

      // Step 2: Handle Tool Calls (if any)
      if (response.functionCalls && response.functionCalls.length > 0) {
        const ai = new (await import('@google/genai')).GoogleGenAI({ apiKey: process.env.API_KEY });
        const chat = ai.chats.create({
          model: 'gemini-3-pro-preview',
        });
        
        const functionResponses = [];

        for (const fc of response.functionCalls) {
          let result: any = "ok";
          
          if (fc.name === 'get_leads') {
            const leads = db.getAllLeads();
            result = fc.args.filter_saved ? leads.filter(l => (l as any).isSaved) : leads;
          } else if (fc.name === 'get_lead_details') {
            result = db.getLeadById(fc.args.id) || "Lead not found";
          } else if (fc.name === 'update_lead_intelligence') {
            await db.updateLeadIntelligence(fc.args.id, {
              notes: fc.args.notes,
              proposal: fc.args.proposal,
              pitchAngle: fc.args.pitchAngle
            });
            result = { status: "success", message: "Intelligence profile updated in SQLite." };
            onIntelligenceUpdate?.();
          }

          functionResponses.push({
            id: fc.id,
            name: fc.name,
            response: { result }
          });
        }

        // Step 3: Send responses back to get the final conversational reply
        // We use a fresh chat session or sendMessage to conclude the turn
        // For simplicity in this demo environment, we'll re-query with the context of the tool result
        const finalResponse = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: [
            { role: 'user', parts: [{ text: userMessage }] },
            { role: 'model', parts: response.candidates[0].content.parts },
            { role: 'user', parts: [{ 
              functionResponse: functionResponses[0] // Simplified for one call
            }] }
          ]
        });

        setMessages(prev => [...prev, { role: 'assistant', content: finalResponse.text || "Database updated successfully." }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response.text || "Acknowledged." }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Tactical link severed. Intelligence update failed." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[3000] w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:bg-indigo-500 transition-all transform hover:scale-110 active:scale-95 group"
      >
        <MessageSquare className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-[3000] w-80 md:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[500px]'}`}>
      {/* Header */}
      <div className="p-4 bg-slate-800 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-sm tracking-tight uppercase font-mono">Core <span className="text-indigo-400">Strategist</span></span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-slate-700 rounded transition-colors">
            {isMinimized ? <Maximize2 className="w-4 h-4 text-slate-400" /> : <Minimize2 className="w-4 h-4 text-slate-400" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-rose-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <div className={`p-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 rounded-tl-none flex gap-1">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Store docs, generate pitch..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 p-2 rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-indigo-600/20"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatBot;
