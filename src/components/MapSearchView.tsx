import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { apiClient } from '../services/apiClient';
import { Parcel, WaterbodyRecord } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from './ui/Toast';
import { computeParcelFlags } from '../services/riskEngine';
import { Button } from './ui/Button';
import { Drawer } from './ui/Drawer';
import { Chip } from './ui/Chip';
import { PlotTag } from './ui/PlotTag';
import { 
  Search, 
  Layers, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp
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

import { BASEMAP_PROVIDERS, BasemapType } from '../services/basemaps';

export const MapSearchView: React.FC<MapSearchViewProps> = ({
  selectedParcel,
  onSelectParcel
}) => {
  const { t } = useLanguage();
  const { warning } = useToast();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const bufferLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const waterbodyLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const overlapEvidenceGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const tileErrorCountRef = useRef<number>(0);

  // Search & Query Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCity, setActiveCity] = useState('All India');
  const [showCourtDisputesOnly, setShowCourtDisputesOnly] = useState(false);
  const [showRuleFlagsOnly, setShowRuleFlagsOnly] = useState(false);
  const [selectedZoningFilter, setSelectedZoningFilter] = useState<string>('ALL');
  const [searchResults, setSearchResults] = useState<Parcel[]>([]);
  const [waterbodies, setWaterbodies] = useState<WaterbodyRecord[]>([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // 6 Independent Layer Toggles
  const [layerBoundaries, setLayerBoundaries] = useState(true);
  const [layerZoning, setLayerZoning] = useState(true);
  const [layerOwnership, setLayerOwnership] = useState(false);
  const [layerCourtDisputes, setLayerCourtDisputes] = useState(true);
  const [layerEcoBuffer, setLayerEcoBuffer] = useState(true);
  const [layerOverlapEvidence, setLayerOverlapEvidence] = useState(true);

  // Basemap & Advanced Proj4 Section
  const [basemap, setBasemap] = useState<BasemapType>('osm');
  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState(false);
  const [isAdvancedCrsOpen, setIsAdvancedCrsOpen] = useState(false);
  const [hoveredParcel, setHoveredParcel] = useState<Parcel | null>(null);

  // Compute active filters count for badge
  const activeFiltersCount = (activeCity !== 'All India' ? 1 : 0) +
    (showCourtDisputesOnly ? 1 : 0) +
    (showRuleFlagsOnly ? 1 : 0) +
    (selectedZoningFilter !== 'ALL' ? 1 : 0);

  // Load Parcels & Waterbodies from backend
  useEffect(() => {
    async function loadData() {
      try {
        const [parcelRes, wbRes] = await Promise.all([
          apiClient.getParcels({
            q: searchQuery || undefined,
            city: activeCity !== 'All India' ? activeCity : undefined,
            disputed: showCourtDisputesOnly ? true : undefined,
            flagged: showRuleFlagsOnly ? true : undefined,
            limit: 100
          }),
          apiClient.getWaterbodies()
        ]);

        let filtered = parcelRes.items;
        if (selectedZoningFilter !== 'ALL') {
          filtered = filtered.filter(p => p.zoning?.masterPlanClassification?.toUpperCase().includes(selectedZoningFilter));
        }
        setSearchResults(filtered);
        setWaterbodies(wbRes);
      } catch (err) {
        console.error('Failed fetching parcels from backend:', err);
      }
    }
    loadData();
  }, [searchQuery, activeCity, showCourtDisputesOnly, showRuleFlagsOnly, selectedZoningFilter]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: false,
      attributionControl: true
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const initialConfig = BASEMAP_PROVIDERS.osm;
    const initialTiles = L.tileLayer(initialConfig.url, {
      attribution: initialConfig.attribution,
      maxZoom: initialConfig.maxZoom
    }).addTo(map);

    tileLayerRef.current = initialTiles;
    bufferLayerGroupRef.current = L.layerGroup().addTo(map);
    waterbodyLayerGroupRef.current = L.layerGroup().addTo(map);
    polygonLayerGroupRef.current = L.layerGroup().addTo(map);
    overlapEvidenceGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Trigger map invalidateSize to ensure full-bleed rendering without bands
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Tiles with Error Fallback (No CARTO, No Watermarks)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const config = BASEMAP_PROVIDERS[basemap] || BASEMAP_PROVIDERS.osm;
    tileErrorCountRef.current = 0;

    const newTileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom
    });

    // Automatic fallback if tile errors occur
    newTileLayer.on('tileerror', () => {
      tileErrorCountRef.current += 1;
      if (tileErrorCountRef.current === 4) {
        const fallbackOrder: BasemapType[] = ['osm', 'esri_streets', 'esri_satellite'];
        const currentIdx = fallbackOrder.indexOf(basemap);
        const nextBasemap = fallbackOrder[(currentIdx + 1) % fallbackOrder.length];
        setBasemap(nextBasemap);
        warning('Network tile loading notice', `Switched basemap to ${BASEMAP_PROVIDERS[nextBasemap].name} due to provider response.`);
      }
    });

    newTileLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = newTileLayer;
    newTileLayer.bringToBack();
  }, [basemap, warning]);

  // Window resize handler to invalidate map size
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render Polygons & Overlays
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonLayerGroupRef.current) return;

    polygonLayerGroupRef.current.clearLayers();
    bufferLayerGroupRef.current?.clearLayers();
    waterbodyLayerGroupRef.current?.clearLayers();
    overlapEvidenceGroupRef.current?.clearLayers();

    // 1. Waterbodies & Eco-buffers (if toggled)
    if (layerEcoBuffer) {
      waterbodies.forEach((wb) => {
        const ring = wb.boundaryGeojson?.coordinates?.[0] || [];
        if (ring.length > 0) {
          const latLngs = ring.map(c => [c[1], c[0]] as [number, number]);
          const centroid = latLngs[0];

          // Buffer circle
          L.circle(centroid, {
            radius: wb.bufferDistanceMeters,
            color: '#059669',
            dashArray: '4, 4',
            weight: 1.5,
            fillColor: '#10B981',
            fillOpacity: 0.12
          }).addTo(bufferLayerGroupRef.current!);

          // Core Waterbody Polygon
          L.polygon(latLngs, {
            color: '#0284C7',
            weight: 2,
            fillColor: '#38BDF8',
            fillOpacity: 0.6
          }).bindTooltip(`<strong>${wb.name}</strong><br/>${wb.bufferDistanceMeters}m Statutory Eco-Buffer (${wb.type})`, { sticky: true })
            .addTo(waterbodyLayerGroupRef.current!);
        }
      });
    }

    // 2. Cadastral Parcels
    searchResults.forEach((parcel) => {
      const isSelected = selectedParcel?.ulpin === parcel.ulpin;
      const isDisputed = parcel.encumbrance.disputeFlag;
      const computedFlags = computeParcelFlags(parcel);

      let strokeColor = '#0B3D6E';
      let fillColor = '#0B3D6E';
      let fillOpacity = 0.25;

      if (layerCourtDisputes && isDisputed) {
        strokeColor = '#E11D48';
        fillColor = '#E11D48';
        fillOpacity = 0.45;
      } else if (layerZoning) {
        const z = (parcel.zoning?.masterPlanClassification || '').toUpperCase();
        if (z.includes('COMMERCIAL')) {
          strokeColor = '#4F46E5';
          fillColor = '#6366F1';
        } else if (z.includes('INDUSTRIAL')) {
          strokeColor = '#D97706';
          fillColor = '#F59E0B';
        } else if (z.includes('AGRICULTURAL')) {
          strokeColor = '#059669';
          fillColor = '#10B981';
        } else {
          strokeColor = '#0284C7';
          fillColor = '#38BDF8';
        }
      } else if (layerOwnership) {
        strokeColor = parcel.ownership.ownershipType === 'Private Individual' ? '#0B3D6E' : '#7C3AED';
        fillColor = strokeColor;
      }

      const ring = parcel.boundaryGeojson?.coordinates?.[0]?.map((c: number[]) => [c[1], c[0]] as [number, number]) || [];

      if (ring.length > 0) {
        const poly = L.polygon(ring, {
          color: isSelected ? '#E8731A' : strokeColor,
          weight: isSelected ? 4 : layerBoundaries ? 2 : 0.5,
          fillColor,
          fillOpacity: isSelected ? 0.6 : fillOpacity,
          className: isDisputed && layerCourtDisputes ? 'court-dispute-hatch' : ''
        });

        poly.on('click', () => {
          onSelectParcel(parcel);
        });

        poly.on('mouseover', () => {
          setHoveredParcel(parcel);
        });

        poly.on('mouseout', () => {
          setHoveredParcel(null);
        });

        poly.bindTooltip(`
          <div class="font-sans text-xs">
            <strong class="text-[#0B3D6E] font-mono">${parcel.displayUlpin}</strong><br/>
            <span>Survey: ${parcel.surveyNumber}</span><br/>
            <span>Owner: ${parcel.ownership.ownerName}</span><br/>
            <span class="font-semibold ${isDisputed ? 'text-rose-600' : 'text-emerald-700'}">${isDisputed ? 'Court Disputed' : 'Clean Title'}</span>
          </div>
        `, { sticky: true });

        poly.addTo(polygonLayerGroupRef.current!);
      }

      // 3. Overlap Evidence Highlight (if toggled and overlap finding present)
      if (layerOverlapEvidence && computedFlags.some(f => f.ruleId === 'R2' && f.severity === 'high')) {
        if (ring.length > 0) {
          L.polygon(ring, {
            color: '#E11D48',
            weight: 3,
            fillColor: '#E11D48',
            fillOpacity: 0.35,
            dashArray: '4, 4'
          }).bindTooltip(`<strong>Cadastral Overlap (>5%)</strong><br/>Boundary Collision Finding`, { sticky: true })
            .addTo(overlapEvidenceGroupRef.current!);
        }
      }
    });

    // Auto-fit bounds if a city was chosen
    if (activeCity !== 'All India') {
      const city = CITY_PRESETS.find(c => c.name === activeCity);
      if (city) {
        mapInstanceRef.current.setView([city.lat, city.lon], city.zoom);
      }
    }
  }, [
    searchResults,
    waterbodies,
    selectedParcel,
    layerBoundaries,
    layerZoning,
    layerOwnership,
    layerCourtDisputes,
    layerEcoBuffer,
    layerOverlapEvidence
  ]);

  // Animate map when selectedParcel changes
  useEffect(() => {
    if (!selectedParcel || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([selectedParcel.centroidLat, selectedParcel.centroidLon], 16, { duration: 1.2 });
  }, [selectedParcel]);

  return (
    <div className="relative w-full h-[calc(100vh-100px)] min-h-[500px] overflow-hidden flex flex-col">
      {/* Full-Bleed Leaflet Canvas */}
      <div ref={mapContainerRef} className="w-full h-full grow z-0" />

      {/* Top Floating Search & Filter Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 max-w-xl w-full">
        <div className="relative grow bg-white rounded-xl shadow-md border border-[#E2E8F0] flex items-center overflow-hidden">
          <Search className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full px-3 py-2.5 text-sm bg-transparent border-none focus:outline-none placeholder:text-slate-400 font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mr-3 text-xs text-slate-400 hover:text-slate-700 cursor-pointer font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Single Filters Button with Active Count Badge */}
        <Button
          variant={activeFiltersCount > 0 ? 'primary' : 'outline'}
          size="md"
          leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          onClick={() => setIsFilterDrawerOpen(true)}
          className="bg-white shadow-md shrink-0"
        >
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 font-mono text-xs font-bold">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {/* Layers Control Toggle Button */}
        <Button
          variant={isLayersMenuOpen ? 'primary' : 'outline'}
          size="md"
          leftIcon={<Layers className="w-4 h-4" />}
          onClick={() => setIsLayersMenuOpen(!isLayersMenuOpen)}
          className="bg-white shadow-md shrink-0"
        >
          <span>Layers</span>
        </Button>
      </div>

      {/* Independent Layers Floating Panel (Top Right, doesn't overlap search bar) */}
      {isLayersMenuOpen && (
        <div className="absolute top-16 right-4 z-20 w-72 bg-white rounded-xl shadow-xl border border-[#CBD5E1] p-4 space-y-3 animate-in fade-in duration-150 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-serif font-bold text-sm text-[#0B3D6E]">Cadastral Map Layers</h4>
            <span className="text-[10px] text-slate-400">Independent Toggles</span>
          </div>

          <div className="space-y-2 text-[#334155]">
            <label className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1.5 rounded">
              <span>{t('mapLayerBoundaries')}</span>
              <input
                type="checkbox"
                checked={layerBoundaries}
                onChange={(e) => setLayerBoundaries(e.target.checked)}
                className="rounded text-[#0B3D6E] focus:ring-[#0B3D6E]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1.5 rounded">
              <span>{t('mapLayerZoning')}</span>
              <input
                type="checkbox"
                checked={layerZoning}
                onChange={(e) => setLayerZoning(e.target.checked)}
                className="rounded text-[#0B3D6E] focus:ring-[#0B3D6E]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1.5 rounded">
              <span>{t('mapLayerOwnership')}</span>
              <input
                type="checkbox"
                checked={layerOwnership}
                onChange={(e) => setLayerOwnership(e.target.checked)}
                className="rounded text-[#0B3D6E] focus:ring-[#0B3D6E]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1.5 rounded">
              <span className="text-rose-900 font-semibold">{t('mapLayerCourtDisputes')}</span>
              <input
                type="checkbox"
                checked={layerCourtDisputes}
                onChange={(e) => setLayerCourtDisputes(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1.5 rounded">
              <span className="text-emerald-900">{t('mapLayerEcoBuffer')}</span>
              <input
                type="checkbox"
                checked={layerEcoBuffer}
                onChange={(e) => setLayerEcoBuffer(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1.5 rounded">
              <span className="text-rose-900 font-semibold">{t('mapLayerOverlapEvidence')}</span>
              <input
                type="checkbox"
                checked={layerOverlapEvidence}
                onChange={(e) => setLayerOverlapEvidence(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
            </label>
          </div>

          {/* Clean Basemap Switcher (No CARTO keys, OpenStreetMap Default) */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              {t('basemapProvider')}
            </span>
            <div className="grid grid-cols-3 gap-1">
              {(['osm', 'esri_streets', 'esri_satellite'] as BasemapType[]).map((b) => (
                <button
                  key={b}
                  onClick={() => setBasemap(b)}
                  className={`py-1.5 px-1 rounded text-[10px] font-semibold transition-colors truncate cursor-pointer ${
                    basemap === b ? 'bg-[#0B3D6E] text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={BASEMAP_PROVIDERS[b].name}
                >
                  {b === 'osm' ? 'OSM Standard' : b === 'esri_streets' ? 'Esri Streets' : 'Satellite'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hover Card (ULPIN, masked owner, flag count) */}
      {hoveredParcel && (
        <div className="absolute top-18 left-4 z-20 bg-white/95 backdrop-blur-xs rounded-xl shadow-lg border border-[#CBD5E1] p-3 max-w-xs pointer-events-none animate-in fade-in duration-100">
          <PlotTag ulpin={hoveredParcel.ulpin} size="sm" showCopy={false} />
          <div className="mt-2 space-y-0.5 text-xs text-[#334155]">
            <p><strong>{t('surveyNumberLabel')}</strong> {hoveredParcel.surveyNumber}</p>
            <p><strong>{t('ownerNameLabel')}</strong> {hoveredParcel.ownership.ownerName}</p>
            <p><strong>{t('zoningCategoryLabel')}</strong> {hoveredParcel.zoning?.masterPlanClassification || 'N/A'}</p>
            <div className="pt-1 flex items-center gap-1.5">
              <Chip
                size="sm"
                severity={hoveredParcel.encumbrance.disputeFlag ? 'court' : 'clear'}
                label={hoveredParcel.encumbrance.disputeFlag ? t('civilCourtInjunction') : t('clearTitle')}
              />
              {computeParcelFlags(hoveredParcel).length > 0 && (
                <span className="text-[10px] font-mono text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  {computeParcelFlags(hoveredParcel).length} {t('ruleFlags')}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Legend (Bottom Left, isolated from zoom control at bottom right) */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-[#CBD5E1] p-3 text-xs space-y-2 max-w-xs">
        <h5 className="font-semibold text-[#0B3D6E] text-[11px] uppercase tracking-wider">
          {t('mapLegendTitle')}
        </h5>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-[#0284C7] opacity-80 border border-[#0284C7]" />
            <span>{t('landUseResidential')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-[#4F46E5] opacity-80 border border-[#4F46E5]" />
            <span>{t('landUseCommercial')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-[#D97706] opacity-80 border border-[#D97706]" />
            <span>{t('landUseIndustrial')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-[#059669] opacity-80 border border-[#059669]" />
            <span>{t('mapLayerEcoBuffer')}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <span className="w-4 h-3 rounded-xs bg-rose-500 border border-rose-700 border-dashed opacity-85" />
            <span className="text-rose-900 font-semibold">{t('mapLayerCourtDisputes')}</span>
          </div>
        </div>

        {/* Foldable Advanced Proj4 / CRS Section */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => setIsAdvancedCrsOpen(!isAdvancedCrsOpen)}
            className="flex items-center justify-between w-full text-[10px] text-slate-500 font-semibold hover:text-[#0B3D6E] cursor-pointer"
          >
            <span>{t('mapCrsAdvanced')} (EPSG:4326)</span>
            {isAdvancedCrsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {isAdvancedCrsOpen && (
            <div className="mt-2 space-y-1 text-[10px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
              <p><strong>Ellipsoid:</strong> WGS84 Geodetic</p>
              <p><strong>EPSG:</strong> 4326 (Lon/Lat Decimal Degrees)</p>
              <p><strong>Cadastral Grid:</strong> 14-Digit Bhu-Aadhaar Centroid</p>
            </div>
          )}
        </div>
      </div>

      {/* FILTERS DRAWER */}
      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title={t('mapFilterDrawerTitle')}
        subtitle={t('filterDrawerSubtitle')}
      >
        <div className="space-y-6 text-sm">
          {/* City / Jurisdiction Preset */}
          <div>
            <label className="font-semibold text-slate-800 block mb-2">
              {t('filterMetro')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CITY_PRESETS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setActiveCity(c.name)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold text-left transition-colors cursor-pointer ${
                    activeCity === c.name
                      ? 'bg-[#0B3D6E] text-white border-[#0B3D6E] shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Filter Checkboxes */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="font-semibold text-slate-800">{t('anomalyLegalFilters')}</h4>
            <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={showCourtDisputesOnly}
                onChange={(e) => setShowCourtDisputesOnly(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-rose-900 block text-xs">{t('filterDisputed')}</span>
                <span className="text-[11px] text-slate-500">{t('parcelsWithStayOrders')}</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={showRuleFlagsOnly}
                onChange={(e) => setShowRuleFlagsOnly(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <div>
                <span className="font-semibold text-amber-900 block text-xs">{t('filterFlagged')}</span>
                <span className="text-[11px] text-slate-500">{t('parcelsWithRuleFlags')}</span>
              </div>
            </label>
          </div>

          {/* Master Plan Zoning Filter */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="font-semibold text-slate-800 block">
              {t('zoningClassification')}
            </label>
            <select
              value={selectedZoningFilter}
              onChange={(e) => setSelectedZoningFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3D6E]"
            >
              <option value="ALL">{t('allZonalMasterPlans')}</option>
              <option value="RESIDENTIAL">Residential (Urban/R1)</option>
              <option value="COMMERCIAL">Commercial (Zonal/C2)</option>
              <option value="INDUSTRIAL">Industrial / Tech Park</option>
              <option value="AGRICULTURAL">Agricultural / Green Belt</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveCity('All India');
                setShowCourtDisputesOnly(false);
                setShowRuleFlagsOnly(false);
                setSelectedZoningFilter('ALL');
              }}
            >
              {t('resetFilters')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsFilterDrawerOpen(false)}
            >
              {t('applyBtn')} ({searchResults.length} {t('navCadastre')})
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
