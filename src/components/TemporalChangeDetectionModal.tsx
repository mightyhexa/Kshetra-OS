import React, { useState } from 'react';
import { Parcel } from '../types';
import { X, Satellite, AlertTriangle, Layers, Calendar, Eye, CheckCircle2 } from 'lucide-react';

interface TemporalChangeDetectionModalProps {
  parcel: Parcel | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TemporalChangeDetectionModal: React.FC<TemporalChangeDetectionModalProps> = ({
  parcel,
  isOpen,
  onClose
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 50% split
  const [highlightChanges, setHighlightChanges] = useState<boolean>(true);

  if (!isOpen || !parcel) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#0B3D6E] text-white rounded-lg">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  ISRO Bhuvan Satellite Temporal Change Detection Engine
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                  Orthophoto AI Shard
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Multi-temporal satellite pass comparison (2021 Baseline vs 2024 Current) over ULPIN {parcel.ulpin}.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Change Detection Summary Alert */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
          <div className="font-bold text-amber-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>AI Built-up Footprint Anomaly Detected (+38.4% Structural Expansion)</span>
          </div>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            Temporal change analysis shows 540 m² of unauthorized built-up area constructed between March 2021 and January 2024. Boundary buffer encroaches 8.2 meters into the municipal storm-water setback.
          </p>
        </div>

        {/* Interactive Before / After Split Slider Visualizer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5 text-blue-800">
              <Calendar className="w-3.5 h-3.5" />
              <span>ISRO Cartosat-2 Baseline (March 2021)</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-800">
              <Calendar className="w-3.5 h-3.5" />
              <span>EOS-04 High-Res Orthophoto (Jan 2024)</span>
            </div>
          </div>

          {/* Graphical Split Box */}
          <div className="relative w-full h-64 rounded-xl border border-slate-300 overflow-hidden select-none bg-slate-900 shadow-inner">
            {/* 2021 Layer (Left Base) */}
            <div className="absolute inset-0 bg-linear-to-br from-emerald-800 to-green-950 flex flex-col items-center justify-center text-white">
              {/* Simulated Rural / Farmland Cadastre */}
              <div className="w-full h-full p-6 relative opacity-70">
                <div className="border-2 border-dashed border-white/60 w-3/4 h-3/4 rounded-lg flex items-center justify-center text-xs font-mono">
                  [2021: Survey {parcel.surveyNumber} — Open Agricultural / Permitted Ground]
                </div>
              </div>
            </div>

            {/* 2024 Layer (Right Clipped Overlay) */}
            <div
              className="absolute inset-y-0 right-0 bg-linear-to-br from-slate-800 to-slate-950 border-l-2 border-white flex flex-col items-center justify-center text-white transition-none overflow-hidden"
              style={{ width: `${100 - sliderPosition}%` }}
            >
              <div
                className="w-full h-full p-6 relative opacity-85"
                style={{ width: '100%', minWidth: '600px', transform: `translateX(-${sliderPosition}%)` }}
              >
                <div className="border-2 border-white/80 w-3/4 h-3/4 rounded-lg relative">
                  {/* Built-up Footprint Highlight */}
                  {highlightChanges && (
                    <div className="absolute top-4 left-4 right-12 bottom-8 bg-rose-500/40 border-2 border-rose-500 rounded flex items-center justify-center font-bold text-xs text-rose-200">
                      [2024 AI Flag: Unauthorized Commercial Footprint]
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Split Divider Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-lg"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-6 h-6 rounded-full bg-white border border-slate-400 text-slate-800 shadow-md flex items-center justify-center text-[10px] font-bold">
                ↔
              </div>
            </div>
          </div>

          {/* Slider Controller */}
          <div className="flex items-center gap-3 pt-1">
            <span className="text-[11px] text-slate-500 font-medium">Slide to compare:</span>
            <input
              type="range"
              min="5"
              max="95"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(parseInt(e.target.value))}
              className="flex-1 accent-[#0B3D6E] cursor-pointer"
            />
            <span className="text-[11px] font-mono text-slate-700 font-bold">{sliderPosition}%</span>
          </div>
        </div>

        {/* Change Metrics Table */}
        <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
          <div>
            <span className="text-slate-400 block text-[10px] font-sans">2021 Vegetation Index</span>
            <span className="font-bold text-emerald-700">76.4% NDVI (Permitted)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-sans">2024 Impervious Built-up</span>
            <span className="font-bold text-rose-600">62.8% (+38.4% Structural)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-sans">Setback Encroachment</span>
            <span className="font-bold text-amber-700">8.2m inside NGT Buffer</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={highlightChanges}
              onChange={(e) => setHighlightChanges(e.target.checked)}
              className="w-4 h-4 text-[#0B3D6E] rounded"
            />
            <span className="font-medium">Highlight AI Encroachment Polygons (Red Mask)</span>
          </label>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0B3D6E] hover:bg-[#082a4d] text-white font-semibold rounded-lg text-xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
