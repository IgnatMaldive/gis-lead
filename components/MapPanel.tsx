
import React, { useEffect, useRef } from 'react';
import { BusinessLead } from '../types';
import L from 'leaflet';

interface MapPanelProps {
  leads: BusinessLead[];
  savedLeads: BusinessLead[];
  selectedLead: BusinessLead | null;
  onMarkerClick: (lead: BusinessLead) => void;
}

const MapPanel: React.FC<MapPanelProps> = ({ leads, savedLeads, selectedLead, onMarkerClick }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      center: [40.7128, -74.0060], // Default center
      zoom: 13,
    });

    // Dark Mode Tiles (using CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
    }).addTo(mapRef.current);

    // Zoom control in custom position
    L.control.zoom({
      position: 'bottomright'
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when leads change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Combine leads to show all on map
    const allLeads = [...leads];
    savedLeads.forEach(sl => {
      if (!allLeads.some(l => l.id === sl.id)) {
        allLeads.push(sl);
      }
    });

    if (allLeads.length === 0) return;

    const bounds = L.latLngBounds([]);

    allLeads.forEach(lead => {
      const isSaved = savedLeads.some(sl => sl.id === lead.id);
      const color = isSaved ? '#8b5cf6' : (lead.rating >= 4.5 ? '#10b981' : lead.rating >= 3.5 ? '#f59e0b' : '#ef4444');
      
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-10 h-10 rounded-full animate-ping opacity-20" style="background-color: ${color}"></div>
            <div class="w-4 h-4 rounded-full border-2 border-slate-900 shadow-lg" style="background-color: ${color}"></div>
            ${isSaved ? '<div class="absolute -top-3 -right-3 text-[8px] bg-violet-600 text-white rounded px-0.5">SAVED</div>' : ''}
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([lead.latitude, lead.longitude], { icon: customIcon })
        .addTo(mapRef.current!)
        .on('click', () => onMarkerClick(lead));
      
      markersRef.current.push(marker);
      bounds.extend([lead.latitude, lead.longitude]);
    });

    // Auto-fit bounds if we have new leads and we're not currently focused
    if (allLeads.length > 0 && !selectedLead) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [leads, savedLeads, onMarkerClick, selectedLead]);

  // Fly to selected lead
  useEffect(() => {
    if (selectedLead && mapRef.current) {
      mapRef.current.flyTo([selectedLead.latitude, selectedLead.longitude], 16, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [selectedLead]);

  return (
    <div className="w-full h-full relative z-10">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* HUD Info Box */}
      {selectedLead && (
        <div className="absolute top-20 right-6 z-[2000] w-72 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-right">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${savedLeads.some(l => l.id === selectedLead.id) ? 'bg-violet-500' : 'bg-indigo-500'}`}></div>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${savedLeads.some(l => l.id === selectedLead.id) ? 'text-violet-400' : 'text-indigo-400'}`}>
              {savedLeads.some(l => l.id === selectedLead.id) ? 'Archived Intelligence' : 'Active Target Analysis'}
            </span>
          </div>
          <h4 className="font-bold text-slate-100 mb-1">{selectedLead.name}</h4>
          <p className="text-xs text-slate-400 mb-4">{selectedLead.address}</p>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
            <div>LAT: {selectedLead.latitude.toFixed(4)}</div>
            <div>LNG: {selectedLead.longitude.toFixed(4)}</div>
            <div>RATING: {selectedLead.rating}★</div>
            <div className={`${savedLeads.some(l => l.id === selectedLead.id) ? 'text-violet-400' : 'text-indigo-400'} font-bold`}>
              STATUS: {savedLeads.some(l => l.id === selectedLead.id) ? 'SAVED' : 'PRIORITY'}
            </div>
          </div>
        </div>
      )}

      {/* Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }}>
      </div>
    </div>
  );
};

export default MapPanel;
