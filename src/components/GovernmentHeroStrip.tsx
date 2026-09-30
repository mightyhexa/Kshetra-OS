import React from 'react';

/**
 * Official Government Photographic Vignette Strip
 * Depicts Ground Cadastral Survey, SVAMITVA Drone Mapping, Satellite Geodesy & Land Rights Delivery.
 * Styled matching Central Ministry photo montages (e.g. MHA, MoRD, DoLR).
 */

export const GovernmentHeroStrip: React.FC = () => {
  const images = [
    {
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      title: 'Geodetic DGPS Survey',
      desc: 'CORS Network Ground Control'
    },
    {
      url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80',
      title: 'SVAMITVA Drone Mapping',
      desc: 'Large Scale Rural Orthophoto'
    },
    {
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
      title: 'Satellite Remote Sensing',
      desc: 'ISRO Cartosat Cadastral GIS'
    },
    {
      url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
      title: 'Land Governance (RoR)',
      desc: 'Bhu-Aadhaar 14-Digit ULPIN'
    },
    {
      url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
      title: 'Digital Public Infrastructure',
      desc: 'Tamper-Evident SHA-256 Ledger'
    }
  ];

  return (
    <div className="w-full bg-slate-900 border-b border-slate-700 overflow-hidden shadow-inner">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-20 sm:h-24 w-full">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative group overflow-hidden border-r border-slate-800/80 last:border-r-0 select-none"
          >
            <img
              src={img.url}
              alt={img.title}
              className="w-full h-full object-cover object-center filter brightness-90 contrast-105 group-hover:scale-105 group-hover:brightness-100 transition-all duration-700"
            />
            {/* Dark vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-2 sm:p-2.5">
              <span className="text-[10px] sm:text-xs font-bold text-white tracking-wide font-cinzel leading-tight line-clamp-1 drop-shadow-sm">
                {img.title}
              </span>
              <span className="text-[8px] sm:text-[9px] text-amber-300 font-rajdhani font-semibold line-clamp-1">
                {img.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
