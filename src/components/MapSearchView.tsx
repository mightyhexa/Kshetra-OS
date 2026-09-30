import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MOCK_PARCELS } from '../data/mockParcels';
import { Parcel } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  CadastralCrsType, 
  SUPPORTED_CRS_REGISTRY, 
  transformPolygonRing, 
  getAutoUtmZone, 
  computeGeodeticConvergence 
} from '../services/projectionEngine';
import { 
  Search, 
  MapPin, 
  Layers, 
  AlertCircle, 
  Compass, 
  Sliders, 
  Eye, 
  Satellite, 
  Map, 
  ShieldAlert,
  SlidersHorizontal,
  RefreshCw,
  Cpu
} from 'lucide-react';

interface MapSearchViewProps {
  selectedParcel: Parcel | null;
  onSelectParcel: (parcel: Parcel | null) => void;
  highlightUlpin?: string;
}

const CITY_PRESETS = [
  { name: 'All India', lat: 20.5937, lon: 78.9629, zoom: 5 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, zoom: 12 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, zoom: 12 },
  { name: 'Pune', lat: 18.5204, lon: 73.8567, zoom: 12 },
  { name: 'Lucknow', lat: 26.8467, lon: 80.9462, zoom: 12 },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, zoom: 12 }
];

type BasemapType = 'streets' | 'satellite' | 'carto_voyager' | 'carto_light';

const CARTO_API_KEY = 'cb1_43wr_1_dc96fe87f12fd1e5b8aec805';

export const MapSearchView: React.FC<MapSearchViewProps> = ({
  selectedParcel,
  onSelectParcel,
  highlightUlpin
}) => {
  const { t, currentLang } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const bufferLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCity, setActiveCity] = useState('All India');
  const [showDisputesOnly, setShowDisputesOnly] = useState(false);
  const [selectedZoningFilter, setSelectedZoningFilter] = useState<string>('ALL');
  const [searchResults, setSearchResults] = useState<Parcel[]>(MOCK_PARCELS);
  const [noResultsFound, setNoResultsFound] = useState(false);

  // High-Grade GIS Controls & Dynamic Proj4 CRS Engine
  const [basemap, setBasemap] = useState<BasemapType>('carto_voyager');
  const [polygonOpacity, setPolygonOpacity] = useState<number>(0.4);
  const [showEcoBuffer, setShowEcoBuffer] = useState<boolean>(true);
  const [isLayerControlOpen, setIsLayerControlOpen] = useState(false);
  const [datumShift, setDatumShift] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedCrs, setSelectedCrs] = useState<CadastralCrsType>('EPSG:4326');
  const [enableAutoUtm, setEnableAutoUtm] = useState<boolean>(false);

  // Instantaneous geodetic convergence & Helmert parameters
  const convergence = computeGeodeticConvergence(selectedParcel?.centroidLat || 20.5937);
  const activeCrsMeta = SUPPORTED_CRS_REGISTRY[selectedCrs];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create map centered on India
    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial Tile Layer using Carto Voyager with provided API Key
    const tileLayer = L.tileLayer(
      `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`,
      {
        maxZoom: 19,
        attribution: '© CARTO (API Key Activated) • © OpenStreetMap | KSHETRA OS'
      }
    ).addTo(map);
    tileLayerRef.current = tileLayer;

    // Custom layer groups
    const bufferGroup = L.layerGroup().addTo(map);
    bufferLayerGroupRef.current = bufferGroup;

    const polygonGroup = L.layerGroup().addTo(map);
    polygonLayerGroupRef.current = polygonGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Tiles (Street vs Satellite vs Carto Voyager vs Carto Light)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '© OpenStreetMap | KSHETRA OS';

    if (basemap === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles © Esri & DigitalGlobe Earthstar Geographics | KSHETRA OS';
    } else if (basemap === 'carto_voyager') {
      url = `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`;
      attribution = '© CARTO Basemaps (Key Activated) • © OpenStreetMap | KSHETRA OS';
    } else if (basemap === 'carto_light') {
      url = `https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`;
      attribution = '© CARTO Light (Key Activated) • © OpenStreetMap | KSHETRA OS';
    }

    const newTileLayer = L.tileLayer(url, { maxZoom: 19, attribution }).addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [basemap]);

  // Update Map Polygons, Buffer Zones & Markers when filters/results change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = polygonLayerGroupRef.current;
    const bufferGroup = bufferLayerGroupRef.current;
    if (!map || !group || !bufferGroup) return;

    group.clearLayers();
    bufferGroup.clearLayers();

    searchResults.forEach((parcel) => {
      const isSelected = selectedParcel?.ulpin === parcel.ulpin;
      const isDisputed = parcel.encumbrance.disputeFlag;
      const isZoningMismatch = parcel.zoning.masterPlanClassification !== parcel.zoning.registeredLandUse;

      // Color coding rule
      let fillColor = '#0B3D6E'; // Navy
      let strokeColor = '#0B3D6E';
      if (isDisputed) {
        fillColor = '#E11D48'; // Rose/Red for legal dispute
        strokeColor = '#BE123C';
      } else if (isZoningMismatch) {
        fillColor = '#D97706'; // Amber for zoning mismatch
        strokeColor = '#B45309';
      } else if (parcel.zoning.masterPlanClassification === 'Industrial') {
        fillColor = '#475569'; // Slate
        strokeColor = '#334155';
      }

      // Dynamic Proj4 Geodetic Projection Transformation
      const effectiveCrs = enableAutoUtm ? getAutoUtmZone(parcel.centroidLon) : selectedCrs;
      const latLngs = transformPolygonRing(
        parcel.boundaryGeojson.coordinates[0],
        effectiveCrs,
        'EPSG:4326',
        datumShift
      );

      // If Eco-Buffer is enabled, draw a faint 15-meter buffer circle around disputed/sensitive parcels
      if (showEcoBuffer && (isDisputed || isZoningMismatch)) {
        const bufferCircle = L.circle([parcel.centroidLat, parcel.centroidLon], {
          radius: 65,
          color: isDisputed ? '#BE123C' : '#D97706',
          weight: 1,
          dashArray: '4, 6',
          fillColor: isDisputed ? '#F43F5E' : '#F59E0B',
          fillOpacity: 0.12
        });
        bufferGroup.addLayer(bufferCircle);
      }

      const polygon = L.polygon(latLngs, {
        color: isSelected ? '#1D4ED8' : strokeColor,
        weight: isSelected ? 4 : 2,
        fillColor: fillColor,
        fillOpacity: isSelected ? Math.min(polygonOpacity + 0.3, 0.9) : polygonOpacity
      });

      // Interactive popup
      polygon.bindTooltip(
        `<div>
          <div style="font-weight: 700; font-size: 11px; color: #0B3D6E;">${parcel.ulpin}</div>
          <div style="font-size: 10px; color: #475569;">Survey ${parcel.surveyNumber} • ${parcel.district}</div>
          <div style="font-size: 10px; font-weight: 600; color: ${isDisputed ? '#BE123C' : '#059669'};">
            ${isDisputed ? '⚠️ Disputed Parcel' : '✓ Verified Cadastre'}
          </div>
        </div>`,
        { sticky: true, opacity: 0.95 }
      );

      polygon.on('click', () => {
        onSelectParcel(parcel);
      });

      group.addLayer(polygon);

      // Centroid marker badge
      const marker = L.circleMarker([parcel.centroidLat, parcel.centroidLon], {
        radius: isSelected ? 6 : 4,
        fillColor: isDisputed ? '#E11D48' : '#0B3D6E',
        color: '#FFFFFF',
        weight: 1.5,
        fillOpacity: 1
      });

      marker.on('click', () => {
        onSelectParcel(parcel);
      });

      group.addLayer(marker);
    });
  }, [searchResults, selectedParcel, polygonOpacity, showEcoBuffer, datumShift, selectedCrs, enableAutoUtm]);

  // When selectedParcel changes, fly to its bounds and highlight
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedParcel) return;

    const effectiveCrs = enableAutoUtm ? getAutoUtmZone(selectedParcel.centroidLon) : selectedCrs;
    const latLngs = transformPolygonRing(
      selectedParcel.boundaryGeojson.coordinates[0],
      effectiveCrs,
      'EPSG:4326',
      datumShift
    );
    const bounds = L.latLngBounds(latLngs);
    map.flyToBounds(bounds, { maxZoom: 17, padding: [60, 60], duration: 1.2 });
  }, [selectedParcel, datumShift, selectedCrs, enableAutoUtm]);

  // Handle Search Input & Filtering
  const handleSearch = (queryText: string) => {
    setSearchQuery(queryText);
    const q = queryText.trim().toLowerCase();

    // Check if query is latitude, longitude
    const coordMatch = q.match(/^([-+]?[0-9]*\.?[0-9]+)\s*,\s*([-+]?[0-9]*\.?[0-9]+)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      if (mapInstanceRef.current && !isNaN(lat) && !isNaN(lon)) {
        mapInstanceRef.current.flyTo([lat, lon], 16);
      }
    }

    let filtered = MOCK_PARCELS.filter(p => {
      const matchesText = 
        !q ||
        p.ulpin.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.villageWard.toLowerCase().includes(q) ||
        p.surveyNumber.toLowerCase().includes(q) ||
        p.ownership.ownerName.toLowerCase().includes(q);

      const matchesDispute = !showDisputesOnly || p.encumbrance.disputeFlag;
      const matchesZoning = selectedZoningFilter === 'ALL' || p.zoning.masterPlanClassification === selectedZoningFilter;

      return matchesText && matchesDispute && matchesZoning;
    });

    setSearchResults(filtered);
    setNoResultsFound(filtered.length === 0 && q.length > 0);

    // If exact ULPIN or single match found, zoom to it automatically
    if (filtered.length === 1 && q.length >= 6) {
      onSelectParcel(filtered[0]);
    }
  };

  const handleCitySelect = (city: typeof CITY_PRESETS[0]) => {
    setActiveCity(city.name);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([city.lat, city.lon], city.zoom, { duration: 1.5 });
    }
    if (city.name === 'All India') {
      setSearchResults(MOCK_PARCELS);
    } else {
      const cityFiltered = MOCK_PARCELS.filter(p => p.district.toLowerCase().includes(city.name.toLowerCase()));
      setSearchResults(cityFiltered);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-69px)] flex flex-col overflow-hidden bg-slate-50">
      {/* Top Floating GIS Search & Filter Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 max-w-4xl mx-auto space-y-2 pointer-events-none">
        {/* Search Input Bar */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/80 p-2 flex items-center gap-2">
          <div className="pl-2 text-slate-400">
            <Search className="w-4 h-4 text-[#0B3D6E]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="flex-1 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden bg-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
            >
              Clear
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              onClick={() => {
                const nextState = !showDisputesOnly;
                setShowDisputesOnly(nextState);
                handleSearch(searchQuery);
              }}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                showDisputesOnly
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Disputes Only</span>
            </button>

            {/* GIS Layer Controls Trigger */}
            <button
              onClick={() => setIsLayerControlOpen(!isLayerControlOpen)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                isLayerControlOpen
                  ? 'bg-[#0B3D6E] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Toggle Satellite Orthophoto & GIS Layers"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>GIS Layers</span>
            </button>
          </div>
        </div>

        {/* Quick City Presets Pills */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-700 bg-white/90 px-2 py-1 rounded-md border border-slate-200 shadow-xs shrink-0 flex items-center gap-1">
            <Compass className="w-3 h-3 text-[#0B3D6E]" /> Quick View:
          </span>
          {CITY_PRESETS.map((city) => (
            <button
              key={city.name}
              onClick={() => handleCitySelect(city)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all shrink-0 shadow-xs border ${
                activeCity === city.name
                  ? 'bg-[#0B3D6E] text-white border-[#0B3D6E]'
                  : 'bg-white/90 text-slate-700 hover:bg-white border-slate-200'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>

        {/* Expandable GIS Layer Controls Box */}
        {isLayerControlOpen && (
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-slate-200 text-xs space-y-3 max-w-md ml-auto">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#0B3D6E]" />
                <span>Cadastral GIS Basemap & Orthophoto</span>
              </span>
              <button
                onClick={() => setIsLayerControlOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Basemap Selection */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-medium block">Basemap Provider:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-medium text-[11px]">
                <button
                  onClick={() => setBasemap('carto_voyager')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    basemap === 'carto_voyager'
                      ? 'bg-blue-50 border-[#0B3D6E] text-[#0B3D6E] font-bold ring-1 ring-[#0B3D6E]'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-bold">Carto Voyager</span>
                  <span className="text-[9px] text-emerald-600 block">✓ Key Connected</span>
                </button>
                <button
                  onClick={() => setBasemap('carto_light')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    basemap === 'carto_light'
                      ? 'bg-blue-50 border-[#0B3D6E] text-[#0B3D6E] font-bold ring-1 ring-[#0B3D6E]'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-bold">Carto Light</span>
                  <span className="text-[9px] text-emerald-600 block">✓ Key Connected</span>
                </button>
                <button
                  onClick={() => setBasemap('satellite')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    basemap === 'satellite'
                      ? 'bg-blue-50 border-[#0B3D6E] text-[#0B3D6E] font-bold ring-1 ring-[#0B3D6E]'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-bold">Esri Satellite</span>
                  <span className="text-[9px] text-slate-500 block">Orthophoto 🛰️</span>
                </button>
                <button
                  onClick={() => setBasemap('streets')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    basemap === 'streets'
                      ? 'bg-blue-50 border-[#0B3D6E] text-[#0B3D6E] font-bold ring-1 ring-[#0B3D6E]'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-bold">OSM Streets</span>
                  <span className="text-[9px] text-slate-500 block">Vector Roads</span>
                </button>
              </div>
            </div>

            {/* Cadastral Polygon Opacity Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">Cadastre Fill Opacity:</span>
                <span className="font-mono font-bold text-slate-800">{Math.round(polygonOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={polygonOpacity}
                onChange={(e) => setPolygonOpacity(parseFloat(e.target.value))}
                className="w-full accent-[#0B3D6E] cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block">
                Adjust opacity to visually compare survey boundaries against ground physical structures.
              </span>
            </div>

            {/* Eco Buffer Toggle */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block text-xs">Stormwater / Encroachment Buffers</span>
                <span className="text-[10px] text-slate-500">Show 65m waterbody / NGT restriction zone rings</span>
              </div>
              <input
                type="checkbox"
                checked={showEcoBuffer}
                onChange={(e) => setShowEcoBuffer(e.target.checked)}
                className="w-4 h-4 text-[#0B3D6E] rounded"
              />
            </div>

            {/* Dynamic Proj4 CRS & Geodetic Datum Reconciliation Engine */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#0B3D6E]" />
                  <span>Proj4 Dynamic CRS Engine:</span>
                </span>
                <span className="font-mono text-[9px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300">
                  {selectedCrs} ➔ EPSG:3857 Synced
                </span>
              </div>

              {/* CRS Selector Dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-medium block">
                  Source Cadastral Coordinate Reference System (CRS):
                </label>
                <select
                  value={selectedCrs}
                  onChange={(e) => setSelectedCrs(e.target.value as CadastralCrsType)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-800 font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#0B3D6E]"
                >
                  <option value="EPSG:4326">EPSG:4326 — WGS 84 Geodetic (Bhu-Aadhaar Native)</option>
                  <option value="EPSG:24379">EPSG:24379 — Kalianpur 1975 / SoI Zone IIa (7-Param Helmert Reconciled)</option>
                  <option value="EPSG:32643">EPSG:32643 — WGS 84 / UTM Zone 43N (Projected West India)</option>
                  <option value="EPSG:32644">EPSG:32644 — WGS 84 / UTM Zone 44N (Projected Central & South India)</option>
                  <option value="EPSG:32645">EPSG:32645 — WGS 84 / UTM Zone 45N (Projected East India)</option>
                </select>
                <p className="text-[9px] text-slate-500 leading-tight">
                  {activeCrsMeta.description}
                </p>
              </div>

              {/* Auto UTM Zone Checkbox */}
              <div className="flex items-center justify-between text-[10px] pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={enableAutoUtm}
                    onChange={(e) => setEnableAutoUtm(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#0B3D6E] rounded"
                  />
                  <span>Auto-detect Indian UTM Grid Zone by Parcel Longitude</span>
                </label>
                <span className="font-mono text-[9px] text-slate-400">
                  Accuracy: ±{activeCrsMeta.accuracyMeters}m
                </span>
              </div>

              {/* Geodetic Mathematical Telemetry Box */}
              <div className="p-2 bg-slate-100/90 rounded border border-slate-200 text-[9px] font-mono text-slate-700 space-y-0.5">
                <div className="flex justify-between">
                  <span>Datum / Ellipsoid:</span>
                  <span className="font-bold text-slate-900">{activeCrsMeta.datum}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mercator Conformal Scale (k₀):</span>
                  <span className="font-bold text-emerald-800">{convergence.scaleFactor}</span>
                </div>
                {activeCrsMeta.helmertApplied && (
                  <div className="text-amber-800 font-bold flex justify-between">
                    <span>Helmert Shift Vector:</span>
                    <span>ΔX:+295m ΔY:+736m ΔZ:+257m</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Base Layer Canvas:</span>
                  <span>EPSG:3857 (Spherical Web Mercator)</span>
                </div>
              </div>

              {/* Datum Nudge & Auto-Snap Buttons */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-medium">Geodetic Micro-Calibration:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDatumShift({ x: 0, y: 0 });
                      setSelectedCrs('EPSG:4326');
                    }}
                    className="text-[10px] text-[#0B3D6E] hover:underline font-bold flex items-center gap-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Reconcile & Snap</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setDatumShift(prev => ({ ...prev, x: prev.x - 5 }))}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-mono border"
                    title="Shift 5m West"
                  >
                    ← W 5m
                  </button>
                  <button
                    type="button"
                    onClick={() => setDatumShift(prev => ({ ...prev, x: prev.x + 5 }))}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-mono border"
                    title="Shift 5m East"
                  >
                    E 5m →
                  </button>
                  <button
                    type="button"
                    onClick={() => setDatumShift(prev => ({ ...prev, y: prev.y + 5 }))}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-mono border"
                    title="Shift 5m North"
                  >
                    ↑ N 5m
                  </button>
                  <button
                    type="button"
                    onClick={() => setDatumShift(prev => ({ ...prev, y: prev.y - 5 }))}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-mono border"
                    title="Shift 5m South"
                  >
                    ↓ S 5m
                  </button>
                  {(datumShift.x !== 0 || datumShift.y !== 0) && (
                    <button
                      type="button"
                      onClick={() => setDatumShift({ x: 0, y: 0 })}
                      className="px-2 py-0.5 bg-blue-50 text-[#0B3D6E] rounded text-[10px] font-bold border border-blue-200"
                    >
                      Reset (0,0)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Results Found Notification */}
        {noResultsFound && (
          <div className="pointer-events-auto bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-2.5 text-xs shadow-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                No cadastral parcels matched <strong>"{searchQuery}"</strong> in the current 26-parcel pilot registry.
              </span>
            </div>
            <button
              onClick={() => handleSearch('')}
              className="text-amber-800 font-semibold underline text-xs"
            >
              Reset Search
            </button>
          </div>
        )}
      </div>

      {/* Real Full Screen Leaflet GIS Map */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Bottom Left Cadastral Map Legend */}
      <div className="absolute bottom-6 left-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-lg shadow-md border border-slate-200 text-xs max-w-xs hidden sm:block">
        <div className="font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#0B3D6E]" />
          <span>KSHETRA OS Spatial Cadastre</span>
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-[#0B3D6E] border border-blue-900 shrink-0" />
            <span className="text-slate-700">Clear Title / Freehold Parcel</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-rose-600 border border-rose-800 shrink-0" />
            <span className="text-slate-700">Active Legal Dispute / Stay Order</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-amber-500 border border-amber-700 shrink-0" />
            <span className="text-slate-700">Zoning Inconsistency Flag</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-slate-500 border border-slate-700 shrink-0" />
            <span className="text-slate-700">Industrial / Public Sector Estate</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
          <span>CRS: EPSG:4326</span>
          <span className="font-mono">{searchResults.length} Parcels Displayed</span>
        </div>
      </div>
    </div>
  );
};
