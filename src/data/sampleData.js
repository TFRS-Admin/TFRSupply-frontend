// TFR Supply — Sample Data (Prototype Only)
// All data is representative/hardcoded for prototype purposes

export const FAMILIES = {
  navigator: {
    id: 'navigator',
    name: 'Navigator',
    tagline: 'Command-grade console solutions for Police patrol vehicles.',
    description: 'The Navigator series delivers purpose-built center console systems engineered for the rigors of law enforcement patrol. Designed for seamless integration with primary patrol vehicles.',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
    badge: 'Most Popular',
    badgeColor: 'blue',
    features: ['Modular component system', 'Universal patrol vehicle fitment', 'Integrated cable management', 'Tool-free accessory mounting'],
    category: 'police',
    baseSkuPrefix: 'NAV',
    steps: ['Vehicle', 'Console Style', 'Options', 'Accessories', 'Dependencies'],
  },
  pathfinder: {
    id: 'pathfinder',
    name: 'Pathfinder',
    tagline: 'Heavy-duty mounting platforms for SUV and truck fleets.',
    description: 'Purpose-built for SUV and pickup platforms, the Pathfinder series provides heavy-duty mounting infrastructure that withstands high-demand patrol environments.',
    image: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800&q=80',
    badge: 'SUV/Truck',
    badgeColor: 'green',
    features: ['SUV & truck-specific fitment', 'High load-bearing capacity', 'Integrated power distribution', 'MOLLE accessory panel'],
    category: 'police',
    baseSkuPrefix: 'PF',
    steps: ['Vehicle', 'Platform Size', 'Options', 'Accessories', 'Dependencies'],
  },
  pathway: {
    id: 'pathway',
    name: 'Pathway',
    tagline: 'Streamlined solutions for unmarked and admin vehicles.',
    description: 'The Pathway series offers low-profile, discreet mounting and console solutions for unmarked units, administrative vehicles, and specialty assignments.',
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
    badge: 'Unmarked',
    badgeColor: 'gray',
    features: ['Low-profile design', 'Discreet cable routing', 'Civilian interior compatible', 'Quick-release hardware'],
    category: 'police',
    baseSkuPrefix: 'PWY',
    steps: ['Vehicle', 'Profile Style', 'Options', 'Accessories', 'Dependencies'],
  },
  duraforce: {
    id: 'duraforce',
    name: 'DuraForce',
    tagline: 'Maximum-strength systems for specialty and tactical units.',
    description: 'DuraForce represents TFR Supply\'s highest-strength product line, engineered for SWAT, K9, and tactical units requiring maximum durability and load capacity.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    badge: 'Tactical',
    badgeColor: 'red',
    features: ['MIL-SPEC materials', 'Maximum load capacity', 'K9 and SWAT compatible', 'Armored vehicle fitment available'],
    category: 'police',
    baseSkuPrefix: 'DRF',
    steps: ['Vehicle', 'Configuration', 'Options', 'Accessories', 'Dependencies'],
  },
};

export const VEHICLES = {
  navigator: [
    { year: '2024', make: 'Ford', model: 'Police Interceptor Utility', trim: 'Base' },
    { year: '2024', make: 'Ford', model: 'Police Interceptor Utility', trim: 'Hybrid' },
    { year: '2023', make: 'Ford', model: 'Police Interceptor Utility', trim: 'Base' },
    { year: '2024', make: 'Chevrolet', model: 'Tahoe PPV', trim: 'Police Package' },
    { year: '2023', make: 'Chevrolet', model: 'Tahoe PPV', trim: 'Police Package' },
    { year: '2024', make: 'Dodge', model: 'Durango Pursuit', trim: 'AWD' },
  ],
  pathfinder: [
    { year: '2024', make: 'Ford', model: 'F-150 Police Responder', trim: 'Base' },
    { year: '2024', make: 'Ford', model: 'Explorer Police Interceptor', trim: 'Base' },
    { year: '2024', make: 'Chevrolet', model: 'Tahoe PPV', trim: 'Police Package' },
    { year: '2023', make: 'GMC', model: 'Yukon', trim: 'Fleet' },
    { year: '2024', make: 'Ram', model: '1500 Special Service', trim: 'Fleet' },
  ],
  pathway: [
    { year: '2024', make: 'Ford', model: 'Fusion', trim: 'Hybrid' },
    { year: '2024', make: 'Toyota', model: 'Camry', trim: 'LE' },
    { year: '2024', make: 'Chevrolet', model: 'Malibu', trim: 'Fleet' },
    { year: '2024', make: 'Dodge', model: 'Charger', trim: 'Police Package' },
    { year: '2023', make: 'Ford', model: 'Taurus', trim: 'Police Interceptor' },
  ],
  duraforce: [
    { year: '2024', make: 'Ford', model: 'F-250 Super Duty', trim: 'Fleet' },
    { year: '2024', make: 'Chevrolet', model: 'Silverado 2500HD', trim: 'Work Truck' },
    { year: '2024', make: 'Ram', model: '2500 Heavy Duty', trim: 'Fleet' },
    { year: '2024', make: 'Ford', model: 'Expedition SSV', trim: 'Police Package' },
    { year: '2024', make: 'Chevrolet', model: 'Suburban PPV', trim: 'Police Package' },
  ],
};

export const CORE_OPTIONS = {
  navigator: {
    label: 'Console Style',
    options: [
      { id: 'nav-std', label: 'Standard Console', sku: 'NAV-CS-STD', price: 849, description: 'Full-width center console with dual locking compartments', image: null, popular: true },
      { id: 'nav-pro', label: 'Pro Console', sku: 'NAV-CS-PRO', price: 1149, description: 'Extended console with integrated charging and device dock', image: null, popular: false },
      { id: 'nav-slim', label: 'Slim Console', sku: 'NAV-CS-SLM', price: 699, description: 'Compact profile for vehicles with limited cabin space', image: null, popular: false },
    ],
  },
  pathfinder: {
    label: 'Platform Size',
    options: [
      { id: 'pf-med', label: 'Medium Platform', sku: 'PF-PLT-MED', price: 975, description: 'Standard SUV platform — fits most full-size SUVs', image: null, popular: true },
      { id: 'pf-lrg', label: 'Large Platform', sku: 'PF-PLT-LRG', price: 1275, description: 'Extended platform for Tahoe/Yukon/Expedition', image: null, popular: false },
      { id: 'pf-trk', label: 'Truck Platform', sku: 'PF-PLT-TRK', price: 1099, description: 'Pickup-specific platform with bed anchor options', image: null, popular: false },
    ],
  },
  pathway: {
    label: 'Profile Style',
    options: [
      { id: 'pwy-low', label: 'Low Profile', sku: 'PWY-PRF-LOW', price: 589, description: 'Ultra-discreet — matches factory interior lines', image: null, popular: true },
      { id: 'pwy-std', label: 'Standard Profile', sku: 'PWY-PRF-STD', price: 725, description: 'Balance of discretion and storage capacity', image: null, popular: false },
    ],
  },
  duraforce: {
    label: 'Configuration',
    options: [
      { id: 'drf-k9', label: 'K9 Configuration', sku: 'DRF-CFG-K9', price: 1599, description: 'Optimized for K9 unit vehicles — rear compartment integration', image: null, popular: false },
      { id: 'drf-tac', label: 'Tactical Configuration', sku: 'DRF-CFG-TAC', price: 1849, description: 'SWAT/tactical loadout — maximum storage and quick-access', image: null, popular: true },
      { id: 'drf-gen', label: 'General Heavy Duty', sku: 'DRF-CFG-GEN', price: 1349, description: 'Heavy-duty platform without specialty tactical features', image: null, popular: false },
    ],
  },
};

export const ACCESSORIES = {
  navigator: [
    { id: 'nav-acc-cup', label: 'Dual Cupholder Insert', sku: 'NAV-ACC-CUPX2', price: 49, autoAdded: false, verificationNeeded: false },
    { id: 'nav-acc-light', label: 'LED Interior Light Strip', sku: 'NAV-ACC-LEDST', price: 89, autoAdded: false, verificationNeeded: false },
    { id: 'nav-acc-charge', label: 'Dual USB-C Fast Charger', sku: 'NAV-ACC-USBC2', price: 129, autoAdded: true, verificationNeeded: false },
    { id: 'nav-acc-tab', label: 'Tablet Mount Bracket', sku: 'NAV-ACC-TBMNT', price: 199, autoAdded: false, verificationNeeded: true, verificationReason: 'Vehicle-specific fitment not confirmed — tablet mount compatibility requires year/model verification' },
  ],
  pathfinder: [
    { id: 'pf-acc-molle', label: 'MOLLE Side Panel', sku: 'PF-ACC-MOLLE', price: 149, autoAdded: true, verificationNeeded: false },
    { id: 'pf-acc-pwr', label: 'Power Distribution Block', sku: 'PF-ACC-PWRDB', price: 219, autoAdded: false, verificationNeeded: false },
    { id: 'pf-acc-radio', label: 'Radio Mounting Plate', sku: 'PF-ACC-RADPLT', price: 99, autoAdded: false, verificationNeeded: true, verificationReason: 'Radio model not specified — plate compatibility inferred from vehicle class, not confirmed' },
    { id: 'pf-acc-anc', label: 'Rear Cargo Anchor Kit', sku: 'PF-ACC-ANCKIT', price: 79, autoAdded: false, verificationNeeded: false },
  ],
  pathway: [
    { id: 'pwy-acc-wrap', label: 'Interior Color Wrap (Black)', sku: 'PWY-ACC-WRAPBK', price: 69, autoAdded: false, verificationNeeded: false },
    { id: 'pwy-acc-tether', label: 'Device Tether Kit', sku: 'PWY-ACC-TETH', price: 45, autoAdded: true, verificationNeeded: false },
    { id: 'pwy-acc-qr', label: 'Quick-Release Adapter', sku: 'PWY-ACC-QREL', price: 89, autoAdded: false, verificationNeeded: false },
  ],
  duraforce: [
    { id: 'drf-acc-strap', label: 'Equipment Retention Strap Set', sku: 'DRF-ACC-STRPST', price: 89, autoAdded: true, verificationNeeded: false },
    { id: 'drf-acc-cage', label: 'Rear Cage Integration Bracket', sku: 'DRF-ACC-CGBKT', price: 349, autoAdded: false, verificationNeeded: true, verificationReason: 'Cage integration requires confirmation of rear cage manufacturer and model — not auto-resolved' },
    { id: 'drf-acc-armor', label: 'Ballistic Panel Backer', sku: 'DRF-ACC-BALPNL', price: 599, autoAdded: false, verificationNeeded: true, verificationReason: 'Ballistic rating and compliance requirement must be verified with agency procurement specs' },
    { id: 'drf-acc-light', label: 'High-Lumen Work Light Mount', sku: 'DRF-ACC-HLWLM', price: 179, autoAdded: false, verificationNeeded: false },
  ],
};

export const DEPENDENCIES = {
  navigator: {
    byVehicle: {
      'Ford Police Interceptor Utility': [
        { id: 'dep-nav-ford-bkt', label: 'Ford PIU Bracket Kit', sku: 'NAV-DEP-FORDBKT', type: 'bracket', status: 'confirmed', reason: 'Required for all Ford PIU fitments — confirmed rule', price: 149 },
        { id: 'dep-nav-ford-hrn', label: 'Ford PIU Wiring Harness', sku: 'NAV-DEP-FORDHRN', type: 'harness', status: 'confirmed', reason: 'Vehicle-specific harness required for power integration', price: 199 },
        { id: 'dep-nav-ford-shr', label: 'A-Pillar Shroud (Ford PIU)', sku: 'NAV-DEP-FORDSHR', type: 'shroud', status: 'needs_verification', reason: 'Shroud fitment inferred from 2023 data — 2024 model-year compatibility not confirmed in feed', price: 89 },
      ],
      'Chevrolet Tahoe PPV': [
        { id: 'dep-nav-chev-bkt', label: 'Chevrolet Tahoe Bracket Kit', sku: 'NAV-DEP-CHEVBKT', type: 'bracket', status: 'confirmed', reason: 'Required for Tahoe PPV center console fitment', price: 159 },
        { id: 'dep-nav-chev-ctrl', label: 'Tahoe PPV Controller Module', sku: 'NAV-DEP-CHEVCTRL', type: 'controller', status: 'needs_verification', reason: 'Controller module compatibility inferred — PPV wiring variation not fully mapped', price: 229 },
      ],
      'Dodge Durango Pursuit': [
        { id: 'dep-nav-dodge-bkt', label: 'Dodge Durango Bracket Kit', sku: 'NAV-DEP-DODGBKT', type: 'bracket', status: 'needs_verification', reason: 'Dodge Durango fitment rules incomplete — based on similar platform, not direct vehicle data', price: 149 },
        { id: 'dep-nav-dodge-hrn', label: 'Dodge Durango Wiring Harness', sku: 'NAV-DEP-DODGHRN', type: 'harness', status: 'needs_verification', reason: 'Harness SKU inferred from Durango platform — direct compatibility not confirmed in current data feed', price: 189 },
      ],
    },
    always: [
      { id: 'dep-nav-mnt', label: 'Universal Mount Kit', sku: 'NAV-DEP-MNTKIT', type: 'mount_kit', status: 'confirmed', reason: 'Required for all Navigator installations', price: 79 },
    ],
  },
  pathfinder: {
    byVehicle: {
      'Ford F-150 Police Responder': [
        { id: 'dep-pf-f150-bkt', label: 'F-150 Platform Bracket Set', sku: 'PF-DEP-F150BKT', type: 'bracket', status: 'confirmed', reason: 'Confirmed fitment — F-150 Police Responder 2022-2024', price: 189 },
        { id: 'dep-pf-f150-hrn', label: 'F-150 Harness Extension', sku: 'PF-DEP-F150HRN', type: 'harness', status: 'needs_verification', reason: 'Harness extension length varies by cab configuration — not confirmed for crew vs. super cab', price: 119 },
      ],
      'Chevrolet Tahoe PPV': [
        { id: 'dep-pf-tahoe-bkt', label: 'Tahoe PPV Platform Brackets', sku: 'PF-DEP-TAHBKT', type: 'bracket', status: 'confirmed', reason: 'Direct fitment confirmed — Tahoe PPV 2021-2024', price: 199 },
      ],
      'Ram 1500 Special Service': [
        { id: 'dep-pf-ram-bkt', label: 'Ram 1500 Bracket Kit', sku: 'PF-DEP-RAMBKT', type: 'bracket', status: 'needs_verification', reason: 'Ram SSV data sparse — bracket fitment inferred from 2023 Ram 1500 standard platform, verification required', price: 179 },
      ],
    },
    always: [
      { id: 'dep-pf-anchor', label: 'Platform Anchor Hardware', sku: 'PF-DEP-ANCHWRE', type: 'mount_kit', status: 'confirmed', reason: 'Required for all Pathfinder installations', price: 59 },
    ],
  },
  pathway: {
    byVehicle: {
      'Dodge Charger': [
        { id: 'dep-pwy-chgr-bkt', label: 'Charger Low-Profile Bracket', sku: 'PWY-DEP-CHGRBKT', type: 'bracket', status: 'confirmed', reason: 'Confirmed fitment — Dodge Charger Police Package 2015-2024', price: 129 },
      ],
      'Ford Taurus': [
        { id: 'dep-pwy-tau-bkt', label: 'Taurus Console Bracket', sku: 'PWY-DEP-TAUBKT', type: 'bracket', status: 'needs_verification', reason: 'Ford Taurus production ended 2019 — fitment rule based on legacy data, current-year verification not applicable', price: 109 },
      ],
      'Ford Fusion': [
        { id: 'dep-pwy-fus-bkt', label: 'Fusion Slim Bracket', sku: 'PWY-DEP-FUSBKT', type: 'bracket', status: 'needs_verification', reason: 'Fusion fitment inferred from Pathway slim profile dimensions — not directly confirmed', price: 99 },
      ],
    },
    always: [
      { id: 'dep-pwy-qrmnt', label: 'Quick-Release Mount Set', sku: 'PWY-DEP-QRMNT', type: 'mount_kit', status: 'confirmed', reason: 'Standard for all Pathway installations', price: 49 },
    ],
  },
  duraforce: {
    byVehicle: {
      'Ford F-250 Super Duty': [
        { id: 'dep-drf-f250-bkt', label: 'F-250 Heavy-Duty Bracket Assembly', sku: 'DRF-DEP-F250BKT', type: 'bracket', status: 'confirmed', reason: 'Confirmed — F-250 SD DuraForce integration 2020-2024', price: 299 },
        { id: 'dep-drf-f250-ctrl', label: 'F-250 Power Controller', sku: 'DRF-DEP-F250CTRL', type: 'controller', status: 'confirmed', reason: 'Required power management module for F-250 SD', price: 349 },
      ],
      'Chevrolet Suburban PPV': [
        { id: 'dep-drf-sub-bkt', label: 'Suburban PPV Bracket Kit', sku: 'DRF-DEP-SUBBKT', type: 'bracket', status: 'confirmed', reason: 'Confirmed fitment — Suburban PPV 2021-2024', price: 279 },
        { id: 'dep-drf-sub-hrn', label: 'Suburban PPV Harness', sku: 'DRF-DEP-SUBHRN', type: 'harness', status: 'needs_verification', reason: 'PPV harness routing varies by upfitter — confirmation required before order', price: 219 },
      ],
      'Ram 2500 Heavy Duty': [
        { id: 'dep-drf-ram-bkt', label: 'Ram 2500 HD Bracket Set', sku: 'DRF-DEP-R2500BKT', type: 'bracket', status: 'needs_verification', reason: 'Ram 2500 HD fitment rules not fully validated — pending Manus data review', price: 289 },
      ],
    },
    always: [
      { id: 'dep-drf-hrdwre', label: 'DuraForce Hardware Kit', sku: 'DRF-DEP-HDWKIT', type: 'mount_kit', status: 'confirmed', reason: 'Required for all DuraForce installations', price: 99 },
      { id: 'dep-drf-cable', label: 'Cable Management System', sku: 'DRF-DEP-CBLMGT', type: 'harness', status: 'confirmed', reason: 'Standard cable management for all DuraForce series', price: 69 },
    ],
  },
};

export const DATA_GAPS = [
  { id: 'gap-1', family: 'Navigator', field: 'Ford PIU 2024 Shroud fitment', severity: 'high', note: 'A-Pillar Shroud (NAV-DEP-FORDSHR) compatibility not confirmed for 2024 model year. Requires direct vehicle measurement or Manus catalog cross-reference.' },
  { id: 'gap-2', family: 'Navigator', field: 'Dodge Durango Pursuit full mapping', severity: 'high', note: 'Bracket and harness SKUs for Dodge Durango Pursuit are inferred from similar Dodge platform data. Full dependency tree requires Manus build spec.' },
  { id: 'gap-3', family: 'Pathfinder', field: 'F-150 cab configuration variants', severity: 'medium', note: 'Harness extension length (PF-DEP-F150HRN) depends on crew cab vs. super cab vs. regular cab configuration. Current rules do not account for this variation.' },
  { id: 'gap-4', family: 'Pathfinder', field: 'Ram 1500 Special Service dependency tree', severity: 'high', note: 'Ram SSV bracket (PF-DEP-RAMBKT) is inferred, not confirmed. Full Pathfinder fit for Ram 1500 SSV requires new catalog entry from Manus.' },
  { id: 'gap-5', family: 'Pathway', field: 'Ford Fusion fitment confirmation', severity: 'medium', note: 'Fusion fitment (PWY-DEP-FUSBKT) inferred from Pathway slim profile dimensions. No direct vehicle data in feed. Must be confirmed by installer.' },
  { id: 'gap-6', family: 'Pathway', field: 'Tablet mount accessory compatibility matrix', severity: 'medium', note: 'NAV-ACC-TBMNT compatibility is listed as "Needs Verification" across all vehicles. A full compatibility matrix by device and vehicle is not present in the current data.' },
  { id: 'gap-7', family: 'DuraForce', field: 'Ram 2500 HD complete dependency map', severity: 'high', note: 'DRF-DEP-R2500BKT pending Manus data review. DuraForce + Ram 2500 fitment not validated. Cannot be offered without developer/Manus confirmation.' },
  { id: 'gap-8', family: 'DuraForce', field: 'Ballistic panel compliance specs', severity: 'critical', note: 'DRF-ACC-BALPNL ballistic rating and procurement compliance specifications must come from agency, not from product data. Cannot be auto-resolved.' },
  { id: 'gap-9', family: 'All', field: 'Trim-level option variations', severity: 'medium', note: 'Current prototype treats all trims of the same make/model identically. Trim-level variations (e.g., Hybrid vs Base PIU) may require different bracket or harness SKUs.' },
  { id: 'gap-10', family: 'All', field: 'Pricing data', severity: 'low', note: 'All pricing shown is placeholder data. Actual pricing requires Shopify product feed integration or Manus pricing table.' },
];

export const RULES_DEBUG = {
  navigator: [
    { rule: 'IF vehicle.make === "Ford" AND vehicle.model.includes("Interceptor") THEN auto-add NAV-DEP-FORDBKT + NAV-DEP-FORDHRN', confidence: 'high', source: 'catalog_v2.3' },
    { rule: 'IF vehicle.make === "Ford" AND vehicle.year >= 2023 THEN add NAV-DEP-FORDSHR', confidence: 'medium', source: 'inferred_from_2023_data', verificationNeeded: true },
    { rule: 'IF vehicle.make === "Chevrolet" AND vehicle.model.includes("Tahoe") THEN auto-add NAV-DEP-CHEVBKT', confidence: 'high', source: 'catalog_v2.1' },
    { rule: 'IF vehicle.make === "Chevrolet" AND vehicle.model.includes("Tahoe") THEN add NAV-DEP-CHEVCTRL', confidence: 'medium', source: 'inferred_from_ppv_wiring', verificationNeeded: true },
    { rule: 'IF vehicle.make === "Dodge" THEN add NAV-DEP-DODGBKT + NAV-DEP-DODGHRN', confidence: 'low', source: 'similar_platform_inference', verificationNeeded: true },
    { rule: 'ALWAYS add NAV-DEP-MNTKIT', confidence: 'high', source: 'universal_rule' },
  ],
  pathfinder: [
    { rule: 'IF vehicle.model === "F-150 Police Responder" THEN add PF-DEP-F150BKT', confidence: 'high', source: 'catalog_v2.3' },
    { rule: 'IF vehicle.model === "F-150 Police Responder" AND cab_config unknown THEN add PF-DEP-F150HRN with verification flag', confidence: 'medium', source: 'partial_rule', verificationNeeded: true },
    { rule: 'IF vehicle.model.includes("Tahoe") THEN add PF-DEP-TAHBKT', confidence: 'high', source: 'catalog_v2.2' },
    { rule: 'IF vehicle.make === "Ram" AND vehicle.model.includes("1500") THEN add PF-DEP-RAMBKT', confidence: 'low', source: 'similar_platform_inference', verificationNeeded: true },
    { rule: 'ALWAYS add PF-DEP-ANCHWRE', confidence: 'high', source: 'universal_rule' },
  ],
  pathway: [
    { rule: 'IF vehicle.model === "Charger" THEN add PWY-DEP-CHGRBKT', confidence: 'high', source: 'catalog_v2.1' },
    { rule: 'IF vehicle.model === "Taurus" THEN add PWY-DEP-TAUBKT with legacy flag', confidence: 'medium', source: 'legacy_catalog_2019', verificationNeeded: true },
    { rule: 'IF vehicle.model === "Fusion" THEN add PWY-DEP-FUSBKT with verification', confidence: 'low', source: 'dimension_inference', verificationNeeded: true },
    { rule: 'ALWAYS add PWY-DEP-QRMNT', confidence: 'high', source: 'universal_rule' },
  ],
  duraforce: [
    { rule: 'IF vehicle.model.includes("F-250") THEN add DRF-DEP-F250BKT + DRF-DEP-F250CTRL', confidence: 'high', source: 'catalog_v2.4' },
    { rule: 'IF vehicle.model.includes("Suburban") AND vehicle.trim === "PPV" THEN add DRF-DEP-SUBBKT', confidence: 'high', source: 'catalog_v2.3' },
    { rule: 'IF vehicle.model.includes("Suburban") THEN add DRF-DEP-SUBHRN with verification', confidence: 'medium', source: 'upfitter_variation', verificationNeeded: true },
    { rule: 'IF vehicle.make === "Ram" AND vehicle.model.includes("2500") THEN add DRF-DEP-R2500BKT with verification', confidence: 'low', source: 'pending_manus_review', verificationNeeded: true },
    { rule: 'ALWAYS add DRF-DEP-HDWKIT + DRF-DEP-CBLMGT', confidence: 'high', source: 'universal_rule' },
  ],
};