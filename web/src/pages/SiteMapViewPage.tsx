import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboardContext } from '../context/DashboardContext';
import {
  MapPin,
  Compass,
  Layers,
  Building2,
  AlertTriangle,
  Radio,
  Plus,
  Minus,
  Navigation,
} from 'lucide-react';

interface MapPinPoint {
  id: string;
  name: string;
  code: string;
  x: number; // percentage
  y: number; // percentage
  type: 'high' | 'medium' | 'low' | 'normal' | 'drone';
  statusLabel: string;
  color: string;
  desc: string;
}

export const SiteMapViewPage: React.FC = () => {
  const { sites, sitesList } = useDashboardContext();
  const [selectedSite, setSelectedSite] = useState('All Sites');
  const [activePin, setActivePin] = useState<MapPinPoint | null>(null);

  const pins: MapPinPoint[] = sites
    .filter((s) => selectedSite === 'All Sites' || s.name === selectedSite)
    .map((s, idx) => {
      const x = 20 + ((idx * 27) % 60);
      const y = 25 + ((idx * 31) % 55);
      return {
        id: s.id,
        name: `${s.name} (${s.location})`,
        code: s.code,
        x,
        y,
        type: s.status === 'Active' ? 'normal' : 'low',
        statusLabel: s.status,
        color: s.status === 'Active' ? '#16A34A' : '#F59E0B',
        desc: `${s.location} • ${s.totalMaterials} materials • stock value ${s.stockValueFormatted || '₹0'}`,
      };
    });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Site Map View</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Geospatial tracking of active projects, critical stock alert clusters, and drone surveys
          </p>
        </div>

        {/* Site Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-[#0D5C3A] shadow-xs"
          >
            <option value="All Sites">All Sites</option>
            {sitesList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Map Visualizer Box */}
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-300 shadow-md bg-slate-950">
        {/* Satellite Map Texture Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-85"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600&auto=format&fit=crop&q=80)',
          }}
        />

        {/* Subtle grid overlay to simulate radar / GIS mapping */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* Top Floating Controls */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-white text-xs font-bold">
          <Navigation className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Live GIS Satellite Feed &bull; Tamil Nadu Region</span>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-white/15 text-white">
          <button className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Map Pins */}
        {pins.map((pin) => (
          <div
            key={pin.id}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            onClick={() => setActivePin(pin)}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
          >
            {/* Pulsing ring */}
            <span
              className="absolute -inset-2 rounded-full animate-ping opacity-60 pointer-events-none"
              style={{ backgroundColor: pin.color }}
            />
            {/* Pin Badge */}
            <div
              className="relative w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xl ring-2 ring-white/90 group-hover:scale-125 transition-transform"
              style={{ backgroundColor: pin.color }}
            >
              {pin.type === 'drone' ? (
                <Radio className="w-4 h-4 animate-pulse" />
              ) : (
                <MapPin className="w-4 h-4 fill-white" />
              )}
            </div>

            {/* Label below pin */}
            <span className="absolute top-9 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap pointer-events-none">
              {pin.name}
            </span>
          </div>
        ))}

        {pins.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-20">
            <div className="bg-slate-900/90 backdrop-blur-md text-white p-6 rounded-2xl text-center space-y-3 shadow-2xl border border-white/10 max-w-sm">
              <Building2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-sm">No Project Sites to Map</h4>
              <p className="text-xs text-slate-300">
                Add your project locations to display live GIS coordinates, satellite telemetry, and site pins.
              </p>
              <Link
                to="/sites"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0D5C3A] text-white rounded-lg text-xs font-bold hover:bg-[#094228] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project Site
              </Link>
            </div>
          </div>
        )}

        {/* Selected Pin Info Card (if clicked) */}
        {activePin && (
          <div className="absolute bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-20 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white inline-block mb-1"
                  style={{ backgroundColor: activePin.color }}
                >
                  {activePin.statusLabel}
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm">{activePin.name}</h4>
                <p className="text-[11px] font-mono text-slate-500">{activePin.code}</p>
              </div>
              <button
                onClick={() => setActivePin(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{activePin.desc}</p>
          </div>
        )}

        {/* Bottom Legend Matching Mockup (Image 3 & 4 screen 11) */}
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 text-white text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-red-400/40" />
              <span className="text-[11px] font-medium text-slate-200">High Alert</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-orange-400/40" />
              <span className="text-[11px] font-medium text-slate-200">Medium Alert</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-400/40" />
              <span className="text-[11px] font-medium text-slate-200">Low Alert</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-400/40" />
              <span className="text-[11px] font-medium text-slate-200">Normal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-purple-400/40" />
              <span className="text-[11px] font-medium text-slate-200">Drone Location</span>
            </div>
          </div>

          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            12.9716° N, 80.2437° E
          </span>
        </div>
      </div>
    </div>
  );
};
