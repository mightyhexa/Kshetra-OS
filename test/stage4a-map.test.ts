import { describe, it, expect } from 'vitest';
import { BASEMAP_PROVIDERS } from '../src/services/basemaps';
import { en } from '../src/i18n/en';

describe('PART 4A Verification: Basemaps, Watermark-Free Tiles & Layout Standards', () => {
  it('ensures all configured basemap URLs contain NO CARTO API keys or placeholder query params', () => {
    const providers = Object.values(BASEMAP_PROVIDERS);
    expect(providers.length).toBe(3);

    for (const p of providers) {
      expect(p.url).not.toContain('carto.com');
      expect(p.url).not.toContain('api_key');
      expect(p.url).not.toContain('apikey');
      expect(p.url).not.toContain('key=');
      expect(p.attribution).toBeDefined();
      expect(p.attribution.length).toBeGreaterThan(5);
    }
  });

  it('verifies default basemap is OpenStreetMap (OSM Standard) with open attribution', () => {
    const osm = BASEMAP_PROVIDERS.osm;
    expect(osm).toBeDefined();
    expect(osm.url).toContain('tile.openstreetmap.org');
    expect(osm.attribution).toContain('OpenStreetMap');
  });

  it('verifies Esri public street and satellite tile providers are configured with proper attribution', () => {
    const esriStreets = BASEMAP_PROVIDERS.esri_streets;
    const esriSat = BASEMAP_PROVIDERS.esri_satellite;

    expect(esriStreets.url).toContain('server.arcgisonline.com');
    expect(esriSat.url).toContain('server.arcgisonline.com');
    expect(esriStreets.attribution).toContain('Esri');
    expect(esriSat.attribution).toContain('Esri');
  });

  it('validates decluttered prototype metadata and WCAG guidelines', () => {
    expect(en.footerBuildVersion).toContain('v0.3.0-prototype');
    expect(en.footerAccessibility).toContain('WCAG 2.1 AA');
  });
});
