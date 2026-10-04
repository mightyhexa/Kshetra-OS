import path from 'path';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'kshetra-sih26014-unified-cadastre-secret-2026',
  jwtExpiresIn: '2h',
  publicBaseUrl: process.env.PUBLIC_BASE_URL || process.env.APP_URL || 'https://kshetra.dpi.gov.in',
  dataPath: path.resolve(process.cwd(), 'data', 'kshetra_db.json'),
  sqlitePath: path.resolve(process.cwd(), 'data', 'kshetra.db'),
  dbType: process.env.DB_TYPE || 'sqlite',
  uploadsDir: path.resolve(process.cwd(), 'uploads'),
  maxUploadSizeBytes: 5 * 1024 * 1024, // 5 MB limit
  isDev: process.env.NODE_ENV !== 'production',

  // Stage 2 Risk Engine Thresholds
  OVERLAP_FLAG_PCT: 5.0, // Over 5% is a high severity overlap flag
  OVERLAP_TOLERANCE_PCT: 0.5, // Between 0.5% and 5% is marked info (within legacy survey tolerance)
  WATERBODY_BUFFER_METERS: 65, // NGT statutory stormwater/lake buffer
  DUPLICATE_SALE_DAYS: 90, // Consecutive conveyances within 90 days
  OWNERSHIP_AGE_MIN_YEARS: 30 // Ancestral title verification baseline
};
