import Database from 'better-sqlite3';

export function initializeSqliteSchema(db: Database.Database): void {
  try {
    const docCols = db.pragma('table_info(documents)') as any[];
    if (docCols && docCols.length > 0 && !docCols.some(c => c.name === 'filepath')) {
      db.exec('DROP TABLE documents;');
    }
  } catch {
    // Ignore if table does not exist
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL,
      designation TEXT,
      jurisdiction_district TEXT,
      jurisdiction_state TEXT,
      aadhaar_masked TEXT,
      officer_badge_id TEXT
    );

    CREATE TABLE IF NOT EXISTS parcels (
      ulpin TEXT PRIMARY KEY,
      display_ulpin TEXT NOT NULL,
      survey_number TEXT NOT NULL,
      centroid_lat REAL NOT NULL,
      centroid_lon REAL NOT NULL,
      area_sqm REAL NOT NULL,
      area_acres REAL NOT NULL,
      state TEXT NOT NULL,
      state_code TEXT NOT NULL,
      district TEXT NOT NULL,
      sub_district TEXT NOT NULL,
      village_ward TEXT NOT NULL,
      pin_code TEXT NOT NULL,
      boundary_geojson TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ownership (
      parcel_ulpin TEXT PRIMARY KEY REFERENCES parcels(ulpin),
      owner_name TEXT NOT NULL,
      owner_gender TEXT,
      ownership_type TEXT NOT NULL,
      registration_date TEXT NOT NULL,
      registration_number TEXT NOT NULL,
      sub_registrar_office TEXT NOT NULL,
      stamp_duty_paid_inr REAL NOT NULL,
      market_valuation_inr REAL NOT NULL,
      co_owners_json TEXT
    );

    CREATE TABLE IF NOT EXISTS zoning (
      parcel_ulpin TEXT PRIMARY KEY REFERENCES parcels(ulpin),
      master_plan_classification TEXT NOT NULL,
      registered_land_use TEXT NOT NULL,
      floor_area_ratio_allowed REAL NOT NULL,
      floor_area_ratio_utilized REAL NOT NULL,
      building_permission_status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS encumbrances (
      parcel_ulpin TEXT PRIMARY KEY REFERENCES parcels(ulpin),
      has_mortgage INTEGER NOT NULL,
      dispute_flag INTEGER NOT NULL,
      stay_order_active INTEGER,
      stay_order_details TEXT,
      court_case_number TEXT,
      dispute_reason TEXT,
      mortgage_details_json TEXT
    );

    CREATE TABLE IF NOT EXISTS tax_records (
      parcel_ulpin TEXT PRIMARY KEY REFERENCES parcels(ulpin),
      property_tax_assessment_no TEXT NOT NULL,
      annual_tax_demand_inr REAL NOT NULL,
      tax_status TEXT NOT NULL,
      last_payment_date TEXT,
      assessment_year INTEGER NOT NULL,
      last_assessed_value_inr REAL,
      water_connection_id TEXT,
      electricity_consumer_no TEXT
    );

    CREATE TABLE IF NOT EXISTS sro_deeds (
      deed_id TEXT PRIMARY KEY,
      parcel_ulpin TEXT NOT NULL REFERENCES parcels(ulpin),
      deed_type TEXT NOT NULL,
      buyer_name TEXT NOT NULL,
      seller_name TEXT NOT NULL,
      registration_date TEXT NOT NULL,
      consideration_amount_inr REAL NOT NULL,
      sro_code TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cersai_charges (
      charge_id TEXT PRIMARY KEY,
      parcel_ulpin TEXT NOT NULL REFERENCES parcels(ulpin),
      financial_institution TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      sanction_amount_inr REAL NOT NULL,
      charge_creation_date TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS waterbodies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      district TEXT NOT NULL,
      state TEXT NOT NULL,
      buffer_distance_meters REAL NOT NULL,
      boundary_geojson TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      parcel_ulpin TEXT NOT NULL,
      applicant_name TEXT NOT NULL,
      applicant_aadhaar_masked TEXT NOT NULL,
      request_type TEXT NOT NULL,
      status TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      last_updated_at TEXT NOT NULL,
      urgency TEXT NOT NULL,
      supporting_doc_name TEXT
    );

    CREATE TABLE IF NOT EXISTS workflow_transitions (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL REFERENCES requests(id),
      from_status TEXT,
      to_status TEXT NOT NULL,
      department TEXT NOT NULL,
      actioned_by_role TEXT NOT NULL,
      actioned_by_name TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      remarks TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ledger_blocks (
      block_index INTEGER PRIMARY KEY,
      timestamp TEXT NOT NULL,
      action TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      parcel_ulpin TEXT,
      details TEXT NOT NULL,
      metadata_json TEXT NOT NULL,
      previous_hash TEXT NOT NULL,
      current_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      parcel_ulpin TEXT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      sha256_hash TEXT NOT NULL,
      uploaded_by TEXT NOT NULL,
      uploaded_role TEXT NOT NULL,
      uploaded_at TEXT NOT NULL,
      filepath TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_parcels_district ON parcels(district);
    CREATE INDEX IF NOT EXISTS idx_parcels_survey ON parcels(survey_number);
    CREATE INDEX IF NOT EXISTS idx_sro_deeds_ulpin ON sro_deeds(parcel_ulpin);
    CREATE INDEX IF NOT EXISTS idx_cersai_ulpin ON cersai_charges(parcel_ulpin);
    CREATE INDEX IF NOT EXISTS idx_wf_req ON workflow_transitions(request_id);
  `);
}
