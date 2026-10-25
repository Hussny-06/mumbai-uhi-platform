import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUhiStore } from '../stores/useUhiStore';
import { WARDS_DATA, MODEL_METRICS, MANN_KENDALL_METRICS, PRESET_SCENARIOS } from '../data/staticDatasets';
import { WordsPullUp } from '../components/ui/prisma-hero';
import {
  ArrowRight,
  SlidersHorizontal,
  LineChart,
  FileText,
  ShieldCheck,
  ChevronDown,
  Thermometer,
  Trees,
  Sun,
  Building,
  ExternalLink,
  Cpu,
  Sparkles,
  Info,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
 * MUMBAI URBAN HEAT ISLAND (UHI) AI PLATFORM — SCIENTIFIC RESEARCH LANDING PAGE
 * Features:
 * - 13 Complete Sections
 * - Real Empirical Research Images from `outputs/`
 * - Rigorous LaTeX-grade Mathematical Formulations (Planck, FVC, NDVI, NDBI,
 *   TreeSHAP Shapley Values, Mann-Kendall, Sen's Slope, HVAC Cooling ROI)
 * - Interactive Concept Deconstruction Workbench with Variable Glossaries
 * ───────────────────────────────────────────────────────────────────────────── */

interface ConceptDef {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  badgeColor: string;
  image: string;
  imageCaption: string;
  mathFormula: React.ReactNode;
  plainFormula: string;
  description: string;
  variables: { symbol: string; name: string; unit: string; note: string }[];
  mumbaiInsight: string;
}

const SCIENTIFIC_CONCEPTS: ConceptDef[] = [
  {
    id: 'lst',
    name: 'Land Surface Temperature (LST & UHI)',
    shortName: 'LST Radiance',
    badge: 'Planck Radiative Inversion',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    image: '/images/research/review1_lst.png',
    imageCaption: 'Figure 1: Reconstructed 30m Land Surface Temperature (LST) raster across Greater Mumbai derived from Landsat-8/9 TIRS Band 10.',
    plainFormula: 'T_s = K₂ / ln((ε · K₁ / L_λ) + 1)',
    mathFormula: (
      <div className="flex flex-wrap items-center justify-center py-3 text-base sm:text-lg font-serif text-amber-200">
        <span className="italic mr-2 font-bold">T<sub className="text-xs">s</sub></span> = 
        <div className="inline-flex flex-col items-center mx-2.5 align-middle">
          <span className="border-b border-amber-300/60 px-3 pb-0.5">K<sub className="text-xs">2</sub></span>
          <span className="px-3 pt-0.5 flex items-center">
            ln<span className="font-sans text-sm mx-0.5">(</span>
            <div className="inline-flex flex-col items-center mx-1 align-middle">
              <span className="border-b border-amber-300/60 pb-0.5 text-sm">ε<sub className="text-[10px]">λ</sub> · K<sub className="text-[10px]">1</sub></span>
              <span className="pt-0.5 text-sm">L<sub className="text-[10px]">λ</sub></span>
            </div>
            + 1<span className="font-sans text-sm mx-0.5">)</span>
          </span>
        </div>
        <span className="text-xs font-mono text-[#E1E0CC]/60 ml-2">− 273.15 [°C]</span>
      </div>
    ),
    description:
      'Land Surface Temperature measures the thermodynamic skin temperature of the Earth’s surface. It inverts Planck’s blackbody radiation function applied to thermal infrared radiances, corrected for atmospheric path absorption and surface emissivity.',
    variables: [
      { symbol: 'T_s', name: 'Land Surface Temperature', unit: '°C / K', note: 'True skin temperature of urban canopy/ground' },
      { symbol: 'L_λ', name: 'Top-of-Atmosphere Radiance', unit: 'W/(m²·sr·μm)', note: 'Landsat-8/9 TIRS Band 10 thermal channel (10.6–11.19 μm)' },
      { symbol: 'ε_λ', name: 'Surface Emissivity', unit: 'dimensionless', note: '0.92 (asphalt) to 0.985 (dense mangrove canopy)' },
      { symbol: 'K₁', name: 'Calibration Constant 1', unit: 'W/(m²·sr·μm)', note: '774.8853 for Landsat-8 TIRS' },
      { symbol: 'K₂', name: 'Calibration Constant 2', unit: 'Kelvin', note: '1321.0789 for Landsat-8 TIRS' },
    ],
    mumbaiInsight:
      'In Mumbai, peak daytime LST reaches 41.8°C in unshaded tin-roofed settlements (Dharavi, Ward G/N) and port logistics hubs, while mangrove estuaries and Sanjay Gandhi National Park register 28–30°C, creating a severe +8.4°C local thermal gradient.',
  },
  {
    id: 'ndvi',
    name: 'Vegetation Canopy Index (NDVI)',
    shortName: 'Canopy NDVI',
    badge: 'Chlorophyll Optical Reflectance',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    image: '/images/research/review1_ndvi.png',
    imageCaption: 'Figure 2: 30m Normalized Difference Vegetation Index (NDVI) showing dense northern green sinks vs. arid central concrete corridors.',
    plainFormula: 'NDVI = (ρ_NIR − ρ_Red) / (ρ_NIR + ρ_Red)',
    mathFormula: (
      <div className="flex flex-wrap items-center justify-center py-3 text-base sm:text-lg font-serif text-emerald-300">
        <span className="font-mono font-bold mr-2 text-sm sm:text-base">NDVI</span> = 
        <div className="inline-flex flex-col items-center mx-2.5 align-middle">
          <span className="border-b border-emerald-300/60 px-3 pb-0.5">ρ<sub className="text-xs font-mono">NIR</sub> − ρ<sub className="text-xs font-mono">Red</sub></span>
          <span className="px-3 pt-0.5">ρ<sub className="text-xs font-mono">NIR</sub> + ρ<sub className="text-xs font-mono">Red</sub></span>
        </div>
        <span className="text-xs font-mono text-[#E1E0CC]/60 ml-2">[Range: −1.0 to +1.0]</span>
      </div>
    ),
    description:
      'Normalized Difference Vegetation Index leverages the sharp contrast between strong chlorophyll absorption in red wavelengths and vigorous mesophyll scattering in the near-infrared spectrum to quantify vegetative volume and evapotranspirative cooling capacity.',
    variables: [
      { symbol: 'ρ_NIR', name: 'Near-Infrared Reflectance', unit: 'dimensionless', note: 'Landsat Band 5 (0.851–0.879 μm)' },
      { symbol: 'ρ_Red', name: 'Red Spectrum Reflectance', unit: 'dimensionless', note: 'Landsat Band 4 (0.636–0.673 μm)' },
      { symbol: 'FVC', name: 'Fractional Vegetation Cover', unit: '%', note: '((NDVI − NDVI_soil) / (NDVI_veg − NDVI_soil))²' },
      { symbol: 'ΔT_veg', name: 'Canopy Cooling Coefficient', unit: '°C / ΔNDVI', note: 'Empirically −4.20°C per +0.10 NDVI increase in Mumbai' },
    ],
    mumbaiInsight:
      'Canopy deficits are acute along the central railway corridor: Wards F/N, F/S, and G/N exhibit NDVI < 0.12, depriving 1.4 million citizens of natural evaporative cooling.',
  },
  {
    id: 'ndbi',
    name: 'Built-Up Impervious Index (NDBI)',
    shortName: 'Built-Up NDBI',
    badge: 'Impervious Surface Fraction',
    badgeColor: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
    image: '/images/research/review1_ndbi.png',
    imageCaption: 'Figure 3: 30m Normalized Difference Built-Up Index (NDBI) mapping structural concrete, asphalt density, and corrugated metal.',
    plainFormula: 'NDBI = (ρ_SWIR1 − ρ_NIR) / (ρ_SWIR1 + ρ_NIR)',
    mathFormula: (
      <div className="flex flex-wrap items-center justify-center py-3 text-base sm:text-lg font-serif text-orange-300">
        <span className="font-mono font-bold mr-2 text-sm sm:text-base">NDBI</span> = 
        <div className="inline-flex flex-col items-center mx-2.5 align-middle">
          <span className="border-b border-orange-300/60 px-3 pb-0.5">ρ<sub className="text-xs font-mono">SWIR1</sub> − ρ<sub className="text-xs font-mono">NIR</sub></span>
          <span className="px-3 pt-0.5">ρ<sub className="text-xs font-mono">SWIR1</sub> + ρ<sub className="text-xs font-mono">NIR</sub></span>
        </div>
        <span className="text-xs font-mono text-[#E1E0CC]/60 ml-2">[Range: −1.0 to +1.0]</span>
      </div>
    ),
    description:
      'Normalized Difference Built-Up Index detects impervious urban surfaces. Man-made materials like concrete, asphalt, and masonry reflect higher radiance in shortwave infrared (SWIR) than in near-infrared, making NDBI the dominant predictor of nocturnal urban heat trapping.',
    variables: [
      { symbol: 'ρ_SWIR1', name: 'Shortwave Infrared 1', unit: 'dimensionless', note: 'Landsat Band 6 (1.566–1.651 μm)' },
      { symbol: 'ρ_NIR', name: 'Near-Infrared Reflectance', unit: 'dimensionless', note: 'Landsat Band 5 (0.851–0.879 μm)' },
      { symbol: 'Q_sensible', name: 'Sensible Heat Flux', unit: 'W/m²', note: 'Up to 380 W/m² higher over impervious NDBI > 0.35' },
    ],
    mumbaiInsight:
      'High NDBI wards (> 0.38) retain 78% more thermal inertia into midnight hours, maintaining temperatures above 31°C long after sunset and preventing nocturnal physiological recovery.',
  },
  {
    id: 'climatology',
    name: '28-Year Synoptic Trend & Sen’s Slope',
    shortName: 'IMD Climatology',
    badge: 'Mann-Kendall Rank Statistics',
    badgeColor: 'border-red-500/40 text-[#D94E34] bg-red-500/10',
    image: '/images/research/asad_27yr_temperature_trend.png',
    imageCaption: 'Figure 4: 28-Year IMD synoptic observed annual mean air temperature (1997–2024, N = 383,640) with Sen’s slope linear trend line (+0.44°C/decade).',
    plainFormula: 'Q = median((x_j − x_k) / (j − k)),  Z = (S − sgn(S)) / √Var(S)',
    mathFormula: (
      <div className="flex flex-wrap items-center justify-center py-3 text-base sm:text-lg font-serif text-[#D94E34]">
        <span className="italic mr-2">Q<sub className="text-xs">Sen</sub></span> = 
        <span className="font-mono text-sm mx-2 font-bold">median</span>
        <span className="text-xl">{"{"}</span>
        <div className="inline-flex flex-col items-center mx-1 align-middle text-xs">
          <span className="border-b border-[#D94E34]/60 pb-0.5">x<sub className="text-[10px]">j</sub> − x<sub className="text-[10px]">k</sub></span>
          <span className="pt-0.5">j − k</span>
        </div>
        <span className="text-xl">{"}"}</span>
        <span className="font-mono text-xs sm:text-sm text-[#E1E0CC]/80 ml-3 font-bold">= +0.44°C / decade</span>
        <span className="text-xs font-mono text-teal-400 ml-3">(Z = +4.129, p = 3.64 × 10⁻⁵)</span>
      </div>
    ),
    description:
      'The non-parametric Mann-Kendall test detects monotonic temporal trends without assuming normal distribution. Sen’s slope provides an outlier-robust estimation of the true decadal rate of warming across Mumbai’s 28-year synoptic record.',
    variables: [
      { symbol: 'S', name: 'Mann-Kendall Sum', unit: 'integer', note: '∑ sgn(x_j − x_k) across all pairs k < j' },
      { symbol: 'Z', name: 'Standardized Test Statistic', unit: 'dimensionless', note: '+4.129 (exceeds critical value 1.96 at α = 0.05)' },
      { symbol: 'p', name: 'Two-Tailed Probability', unit: 'p-value', note: '3.64 × 10⁻⁵ (extreme statistical significance)' },
      { symbol: 'Q_Sen', name: 'Sen’s Median Slope', unit: '°C / year', note: '+0.044°C/yr = +0.44°C/decade background heating' },
    ],
    mumbaiInsight:
      'Background climatic heating (+0.44°C/decade) acts as an accelerant atop Mumbai’s structural urban heat island (+6.1°C), compressing human survivability thresholds during April–May pre-monsoon heat waves.',
  },
  {
    id: 'treeshap',
    name: 'TreeSHAP Game-Theoretic Feature Attribution',
    shortName: 'TreeSHAP Attribution',
    badge: 'Cooperative Game Theory',
    badgeColor: 'border-teal-500/40 text-teal-400 bg-teal-500/10',
    image: '/images/research/asad_shap_analysis_xgboost.png',
    imageCaption: 'Figure 5: TreeSHAP summary beeswarm chart decomposing exact ±°C thermal attributions for built-up density, vegetation, albedo, and coastal distance.',
    plainFormula: 'ϕ_i(x) = ∑ [ |S|!(|F| − |S| − 1)! / |F|! ] · [ f(S ∪ {i}) − f(S) ]',
    mathFormula: (
      <div className="flex flex-wrap items-center justify-center py-3 text-base sm:text-lg font-serif text-teal-300">
        <span className="mr-2">ϕ<sub className="text-xs">i</sub>(x)</span> = 
        <span className="text-2xl mx-2 font-sans font-light">∑</span>
        <div className="inline-flex flex-col items-center mx-1 align-middle text-xs">
          <span className="border-b border-teal-300/60 pb-0.5">|S|! · (|F| − |S| − 1)!</span>
          <span className="pt-0.5">|F|!</span>
        </div>
        <span className="font-sans text-xs ml-1.5">[ f(S ∪ {"{"}i{"}"}) − f(S) ]</span>
        <span className="text-xs font-mono text-[#E1E0CC]/60 ml-3">T(x) = ϕ<sub className="text-[10px]">0</sub> + ∑ ϕ<sub className="text-[10px]">i</sub></span>
      </div>
    ),
    description:
      'TreeSHAP computes exact, local Shapley values across gradient boosted decision trees. It guarantees mathematical additivity and consistency, isolating the exact degrees Celsius (±°C) that each biophysical factor contributes to a ward’s heat profile.',
    variables: [
      { symbol: 'ϕ_i(x)', name: 'Shapley Contribution Value', unit: '°C delta', note: 'Exact temperature shift attributed to feature i' },
      { symbol: 'F', name: 'Total Feature Set', unit: 'set', note: '{NDVI, NDBI, MNDWI, Albedo, Elev, DistCoast, VPD, Wind}' },
      { symbol: 'S', name: 'Feature Subset', unit: 'subset', note: 'All marginal permutations without feature i' },
      { symbol: 'ϕ_0', name: 'Base Expected Value', unit: '°C', note: '32.18°C (citywide baseline model intercept)' },
    ],
    mumbaiInsight:
      'Citywide TreeSHAP reveals that NDBI contributes +2.14°C to urban warming, distance from coast adds +1.32°C, while vegetative NDVI cools by −1.82°C and high albedo cools by −1.15°C.',
  },
  {
    id: 'spatial_kfold',
    name: 'Spatial Block K-Fold (1.2 km Halo Isolation)',
    shortName: 'Spatial Block K-Fold',
    badge: 'Zero Spatial Leakage',
    badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    image: '/images/research/asad_ml_validation_comparison.png',
    imageCaption: 'Figure 6: Spatial Block K-Fold XGBoost vs. Random Forest cross-validation performance with 1.2 km dead-zone halo buffer.',
    plainFormula: 'dist(s_train, s_test) ≥ 1.2 km,  R² = 1 − [ ∑(y − ŷ)² / ∑(y − ȳ)² ]',
    mathFormula: (
      <div className="flex flex-wrap items-center justify-center py-3 text-base sm:text-lg font-serif text-blue-300">
        <span className="font-mono text-sm mr-2">dist(s<sub className="text-xs">train</sub>, s<sub className="text-xs">test</sub>)</span> ≥ 
        <span className="font-mono font-bold text-[#E1E0CC] mx-2">1.2 km Halo Buffer</span>
        <span className="text-xs font-mono text-blue-400 mx-2">|</span>
        <span className="italic mr-1">R²</span> = 
        <span className="text-sm">1 − </span>
        <div className="inline-flex flex-col items-center mx-1 align-middle text-xs">
          <span className="border-b border-blue-300/60 pb-0.5">∑ (y<sub className="text-[10px]">i</sub> − ŷ<sub className="text-[10px]">i</sub>)²</span>
          <span className="pt-0.5">∑ (y<sub className="text-[10px]">i</sub> − ȳ)²</span>
        </div>
        <span className="text-xs font-mono text-teal-400 ml-2 font-bold">= 0.94 (RMSE 2.05°C)</span>
      </div>
    ),
    description:
      'Spatial autocorrelation in GIS imagery leads to severe validation leakage when random train/test splits are used. We partition Greater Mumbai into 5 discrete regional geographic blocks and discard all training pixels within a 1.2 km dead-zone halo around the test fold.',
    variables: [
      { symbol: 's_i, s_j', name: 'Spatial Coordinates', unit: 'EPSG:32643', note: 'UTM Zone 43N projected coordinates' },
      { symbol: 'Halo', name: 'Buffer Isolation Distance', unit: 'meters', note: '1,200m exclusion perimeter' },
      { symbol: 'R²', name: 'Coefficient of Determination', unit: 'dimensionless', note: '0.94 for XGBoost (outperforms RF at 0.91)' },
      { symbol: 'RMSE', name: 'Root Mean Squared Error', unit: '°C', note: '2.05°C cross-validated thermal error' },
    ],
    mumbaiInsight:
      'Without spatial buffering, naive models yield a false R² of 0.98 that collapses in deployment. Our 1.2 km halo guarantees real-world generalizability across unobserved municipal parcels.',
  },
];

export const LandingPage: React.FC = () => {
  const { setActivePage, setSelectedWard, toggleTheme, theme } = useUhiStore();
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [previewWardId, setPreviewWardId] = useState<string>('G/N');
  const [activeConceptId, setActiveConceptId] = useState<string>('lst');

  const previewWard = WARDS_DATA.find((w) => w.id === previewWardId) || WARDS_DATA[0];
  const activeConcept = SCIENTIFIC_CONCEPTS.find((c) => c.id === activeConceptId) || SCIENTIFIC_CONCEPTS[0];

  const faqs = [
    {
      q: 'How does 30m microclimate downscaling differ from standard raw satellite heat maps?',
      a: 'Raw thermal sensors like Landsat-8/9 TIRS capture thermal infrared at a coarse 100m native resolution (often resampled to 30m via nearest-neighbor without physical intelligence). Our platform applies Planck radiance inversion coupled with an XGBoost biophysical gradient model trained on 30m multispectral predictors (NDVI, NDBI, MNDWI, Albedo, and elevation). This reconstructs true street-level and building-envelope microclimate temperature gradients with an R² of 0.94 and RMSE of 2.05°C.',
    },
    {
      q: 'What is the 1.2 km spatial block halo and why is it scientifically critical?',
      a: 'Spatial autocorrelation is the primary cause of model hallucination and inflated accuracy in spatial AI. When standard random K-Fold splits are used, training and validation pixels sit immediately adjacent to each other, leaking thermal gradients. Our platform partitions Greater Mumbai into 5 discrete regional geographic blocks and enforces a mandatory 1.2 km dead-zone exclusion halo around test blocks, guaranteeing zero spatial data leakage.',
    },
    {
      q: 'Can municipal planners test custom zoning interventions for specific polygons?',
      a: 'Yes. Planners can either select any of the 24 official BMC administrative wards or activate the polygon drawing tool to trace any custom redevelopment parcel. Adjusting canopy greening (ΔNDVI), cool roof albedo (Δα), or depaving (ΔNDBI) executes a live, 100ms debounced ML simulation predicting post-intervention surface temperatures and grid cell distributions.',
    },
    {
      q: 'How are annual HVAC electricity savings (kWh/m²/yr) computed?',
      a: 'Empirical thermodynamics indicate that for Mumbai’s tropical coastal climate, each 1.0°C reduction in ambient urban surface heat corresponds to an estimated 7.2% reduction in peak commercial and residential chilling loads. The platform models this biophysical heat-flux shift into localized annual energy savings (kWh/m²/yr) and municipal grid megawatt-hour (MWh) offsets.',
    },
    {
      q: 'Are policy dossiers compliant with Brihanmumbai Municipal Corporation (BMC) standards?',
      a: 'Yes. Workspace 04 generates an official municipal briefing typeset sheet structured according to the Mumbai Climate Action Plan (MCAP) and Development Control and Promotion Regulations (DCPR 2034). Planners can download machine-readable CSVs, JSON schemas, or click print to output an unbranded, high-resolution PDF document.',
    },
  ];

  return (
    <div className="w-full min-h-screen overflow-y-auto bg-[#0a0a0c] text-[#E1E0CC] selection:bg-[#D94E34] selection:text-white font-sans">
      
      {/* ── SECTION 1: FLOATING NAVIGATION BAR ──────────────────────────── */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-5xl">
        <div className="backdrop-blur-xl bg-black/60 border border-white/10 rounded-full px-4 py-2.5 flex items-center justify-between shadow-2xl">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#D94E34] shadow-[0_0_12px_#D94E34]" />
            <span className="font-serif font-bold text-sm tracking-tight text-[#E1E0CC]">
              Mumbai UHI Atlas
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono rounded-full bg-white/10 text-[#E1E0CC]/80 border border-white/10">
              30m AI Workbench
            </span>
          </div>

          {/* Quick Nav Anchors */}
          <div className="hidden md:flex items-center gap-6 text-xs text-[#E1E0CC]/75">
            <a href="#stats" className="hover:text-white transition-colors">Telemetry</a>
            <a href="#concepts" className="hover:text-white transition-colors text-amber-300 font-semibold">Empirical Math</a>
            <a href="#problem" className="hover:text-white transition-colors">Thermodynamics</a>
            <a href="#pipeline" className="hover:text-white transition-colors">Methodology</a>
            <a href="#preview" className="hover:text-white transition-colors">Ward Atlas</a>
            <a href="#solutions" className="hover:text-white transition-colors">Interventions</a>
            <a href="#faqs" className="hover:text-white transition-colors">FAQs</a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="px-2.5 py-1 text-xs rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#E1E0CC]/80 transition-colors"
            >
              {theme === 'dark' ? '☀ Light' : '☾ Dark'}
            </button>
            <button
              onClick={() => setActivePage('explorer')}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#D94E34] hover:bg-[#c2422b] text-white text-xs font-semibold shadow-lg transition-all transform hover:scale-105"
            >
              Launch Atlas
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── SECTION 2: HERO SECTION (PRISMA FILMIC BACKDROP) ─────────────── */}
      <section className="relative min-h-[92vh] w-full flex items-end px-4 sm:px-8 md:px-14 pb-12 pt-28 overflow-hidden">
        
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover scale-105 filter brightness-75 contrast-125"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
        />

        {/* Ambient Film Gradients & Noise Scrim */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/60 to-black/30" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-[#0a0a0c]/40 to-[#0a0a0c]" />

        {/* Content Grid */}
        <div className="relative z-10 w-full max-w-7xl mx-auto">
          
          {/* Metadata pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-[#E1E0CC] mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Operational IMD Synoptic Dataset (1997–2024) · N = 383,640</span>
          </div>

          <div className="grid grid-cols-12 items-end gap-6">
            
            {/* Left Big Heading */}
            <div className="col-span-12 lg:col-span-8">
              <h1 className="font-serif font-medium leading-[0.9] tracking-[-0.04em] text-5xl sm:text-7xl md:text-8xl lg:text-[6.8rem] text-[#E1E0CC]">
                <WordsPullUp text="Mumbai Heat Atlas" showAsterisk />
              </h1>
              <p className="mt-4 text-lg sm:text-xl md:text-2xl font-light text-[#E1E0CC]/85 max-w-2xl leading-relaxed">
                30m Satellite Radiometry & Machine Learning Downscaling for Municipal Microclimate Resilience.
              </p>
            </div>

            {/* Right Summary & Launch CTA */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 pb-2">
              <p className="text-sm text-[#E1E0CC]/75 leading-relaxed">
                Bridging Landsat-8/9 TIR Planck sensors, 28-year IMD synoptic records, and spatial TreeSHAP to empower Brihanmumbai Municipal Corporation with sub-second what-if cooling telemetry.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setActivePage('explorer')}
                  className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#D94E34] hover:bg-[#c2422b] text-white font-medium text-sm transition-all shadow-[0_0_24px_rgba(217,78,52,0.4)] cursor-pointer"
                >
                  Enter Spatial Explorer
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => setActivePage('studio')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-[#E1E0CC] text-sm font-medium backdrop-blur-md transition-all cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#D94E34]" />
                  Simulate Interventions
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 3: KEY STATISTICS STRIP ─────────────────────────────── */}
      <section id="stats" className="border-y border-white/10 bg-[#0f1013] py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6">
          
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-3xl md:text-4xl font-mono font-bold text-[#E1E0CC]">30m</div>
            <div className="text-xs uppercase tracking-wider text-[#E1E0CC]/60 mt-1 font-mono">Spatial Grid</div>
            <div className="text-[11px] text-[#E1E0CC]/40 mt-1">Downscaled from 100m TIR</div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-3xl md:text-4xl font-mono font-bold text-[#D94E34]">24 Wards</div>
            <div className="text-xs uppercase tracking-wider text-[#E1E0CC]/60 mt-1 font-mono">BMC Coverage</div>
            <div className="text-[11px] text-[#E1E0CC]/40 mt-1">Colaba to Dahisar & Mulund</div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-3xl md:text-4xl font-mono font-bold text-[#E1E0CC]">383,640</div>
            <div className="text-xs uppercase tracking-wider text-[#E1E0CC]/60 mt-1 font-mono">Synoptic Records</div>
            <div className="text-[11px] text-[#E1E0CC]/40 mt-1">1997–2024 IMD Continuous</div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-3xl md:text-4xl font-mono font-bold text-amber-400">+6.1°C</div>
            <div className="text-xs uppercase tracking-wider text-[#E1E0CC]/60 mt-1 font-mono">Peak UHI Delta</div>
            <div className="text-[11px] text-[#E1E0CC]/40 mt-1">Urban Core vs Coastal Forest</div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 col-span-2 md:col-span-1">
            <div className="text-3xl md:text-4xl font-mono font-bold text-teal-400">0.94 R²</div>
            <div className="text-xs uppercase tracking-wider text-[#E1E0CC]/60 mt-1 font-mono">Downscaling Model</div>
            <div className="text-[11px] text-[#E1E0CC]/40 mt-1">RMSE = 2.05°C (1.2 km Block)</div>
          </div>

        </div>
      </section>

      {/* ── NEW SECTION: EMPIRICAL CONCEPT DECONSTRUCTION & MATHEMATICS ──── */}
      <section id="concepts" className="py-20 px-6 max-w-7xl mx-auto border-b border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-2">
            Empirical Biophysics & Mathematical Rigor
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#E1E0CC]">
            Deconstructing The Science Behind Each Concept.
          </h2>
          <p className="mt-3 text-sm text-[#E1E0CC]/75 leading-relaxed">
            Every temperature estimation, spatial index, and policy inference on this platform is backed by our authentic peer-reviewed research rasters and classical thermodynamic equations.
          </p>
        </div>

        {/* Concept Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {SCIENTIFIC_CONCEPTS.map((concept) => (
            <button
              key={concept.id}
              onClick={() => setActiveConceptId(concept.id)}
              className={`px-4 py-2 rounded-full text-xs font-mono transition-all cursor-pointer flex items-center gap-2 ${
                activeConceptId === concept.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_16px_rgba(245,158,11,0.25)] font-bold'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-[#E1E0CC]/70 border border-white/10'
              }`}
            >
              <span>{concept.shortName}</span>
            </button>
          ))}
        </div>

        {/* Concept Card Detail Showcase */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] via-black/80 to-black p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* LEFT: Entire Uncropped Research Figure (Displayed Whole In-Place) */}
            <div className="lg:col-span-6 flex flex-col gap-3">
              <div className="w-full rounded-2xl overflow-hidden border border-white/15 bg-black/80 p-3 flex items-center justify-center shadow-xl">
                <img
                  src={activeConcept.image}
                  alt={activeConcept.name}
                  className="w-full h-auto max-h-[480px] object-contain rounded-xl"
                  loading="lazy"
                />
              </div>

              <div className="w-full flex items-center justify-between text-xs text-[#E1E0CC]/70 font-mono px-1">
                <span className="text-[11px] leading-tight text-[#E1E0CC]/70">{activeConcept.imageCaption}</span>
                <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full border shrink-0 ml-2 ${activeConcept.badgeColor}`}>
                  {activeConcept.badge}
                </span>
              </div>
            </div>

            {/* RIGHT: Mathematical Formulation & Variable Breakdown */}
            <div className="lg:col-span-6 flex flex-col gap-5">
              
              <div>
                <span className={`inline-block px-2.5 py-0.5 text-[10px] font-mono rounded border ${activeConcept.badgeColor}`}>
                  Physical Formulation
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#E1E0CC] mt-2">
                  {activeConcept.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#E1E0CC]/75 mt-2 leading-relaxed">
                  {activeConcept.description}
                </p>
              </div>

              {/* Styled LaTeX Mathematical Block */}
              <div className="rounded-2xl bg-black/70 border border-white/15 p-4 overflow-x-auto shadow-inner">
                <div className="text-[10px] font-mono text-[#E1E0CC]/50 uppercase tracking-widest mb-1">
                  Governing Equation (LaTeX Representation)
                </div>
                {activeConcept.mathFormula}
              </div>

              {/* Parameter Reference Ledger */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                <div className="text-xs font-mono font-bold text-[#E1E0CC] px-4 py-2 border-b border-white/10 bg-white/[0.03] flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  Variable Ledger & Constants
                </div>
                <div className="divide-y divide-white/5 max-h-48 overflow-y-auto font-mono text-xs">
                  {activeConcept.variables.map((v) => (
                    <div key={v.symbol} className="px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                      <div className="flex items-center gap-2 text-amber-300 font-bold">
                        <span>{v.symbol}</span>
                        <span className="text-[#E1E0CC]/50 font-normal">({v.name})</span>
                      </div>
                      <div className="text-[#E1E0CC]/70">
                        <span className="text-teal-400 mr-2">[{v.unit}]</span>
                        <span>{v.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Municipal Field Note */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200/90 leading-relaxed font-sans">
                <span className="font-bold text-amber-300">Mumbai Local Insight: </span>
                {activeConcept.mumbaiInsight}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 4: ABOUT URBAN HEAT ISLANDS (THERMODYNAMICS) ────────── */}
      <section id="problem" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5">
            <div className="text-xs font-mono uppercase tracking-widest text-[#D94E34] mb-3">
              The Urban Thermodynamic Crisis
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#E1E0CC] leading-tight">
              Why Mumbai Traps Extreme Heat.
            </h2>
            <p className="mt-5 text-sm sm:text-base text-[#E1E0CC]/75 leading-relaxed">
              Mumbai’s unique peninsular geography creates an intense thermodynamic clash: daytime sea breezes push maritime moisture over dense concrete corridors with negligible vegetative canopy, trapping latent heat in impermeable built structures.
            </p>
            
            {/* Surface Energy Budget Equation */}
            <div className="my-6 p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs">
              <div className="text-[10px] text-[#E1E0CC]/50 uppercase tracking-widest mb-1">Surface Energy Equilibrium</div>
              <div className="text-sm font-serif text-amber-200 py-1">
                R<sub className="text-xs">n</sub> = H + λE + G + ΔS
              </div>
              <div className="text-[11px] text-[#E1E0CC]/60 mt-1">
                In dense wards, latent cooling (λE) drops to near 0, diverting net radiation (R<sub className="text-[9px]">n</sub>) into sensible air heating (H) and ground heat storage (G).
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-white/[0.03] border border-white/10">
                <Sun className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#E1E0CC]">Impervious Building Density (High NDBI)</div>
                  <div className="text-xs text-[#E1E0CC]/60 mt-0.5">Tin roofs and unshaded asphalt absorb over 85% of solar irradiance, re-radiating thermal energy long after dusk.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-white/[0.03] border border-white/10">
                <Trees className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#E1E0CC]">Canopy Deficit & Depleted Evapotranspiration</div>
                  <div className="text-xs text-[#E1E0CC]/60 mt-0.5">High-density wards like Dharavi (G/N) exhibit NDVI &lt; 0.11, depriving over 800,000 residents of natural evaporative cooling.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-white/[0.03] border border-white/10">
                <Thermometer className="w-5 h-5 text-[#D94E34] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#E1E0CC]">Compounding Background Climatic Warming</div>
                  <div className="text-xs text-[#E1E0CC]/60 mt-0.5">Sen’s slope analysis confirms Mumbai’s background air temperature warms by +0.44°C/decade (Mann-Kendall p = 3.64e-5).</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6 sm:p-8">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="font-mono text-xs text-[#E1E0CC]/70">Microclimate Differential: Dense Core vs Ecological Buffer</div>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-[#D94E34]/20 text-[#D94E34] border border-[#D94E34]/30">
                  +8.4°C Micro-Anomaly
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Hotspot Card */}
                <div className="p-5 rounded-xl bg-gradient-to-b from-[#D94E34]/15 to-transparent border border-[#D94E34]/30">
                  <div className="text-[10px] font-mono text-[#D94E34] uppercase font-bold tracking-wider">Thermal Hotspot</div>
                  <div className="text-xl font-bold font-serif text-[#E1E0CC] mt-1">Ward G/N (Dharavi / Dadar)</div>
                  <div className="text-3xl font-mono font-bold text-[#D94E34] mt-3">38.4°C <span className="text-xs font-sans text-[#E1E0CC]/60 font-normal">Mean LST</span></div>
                  <div className="mt-4 space-y-1.5 text-xs text-[#E1E0CC]/70 font-mono">
                    <div className="flex justify-between"><span>NDVI (Greenery):</span><span className="text-red-400 font-bold">0.11</span></div>
                    <div className="flex justify-between"><span>NDBI (Built-up):</span><span className="text-red-400 font-bold">0.42</span></div>
                    <div className="flex justify-between"><span>Vulnerability:</span><span className="text-red-400 font-bold">Critical</span></div>
                  </div>
                </div>

                {/* Cool Sanctuary Card */}
                <div className="p-5 rounded-xl bg-gradient-to-b from-teal-500/15 to-transparent border border-teal-500/30">
                  <div className="text-[10px] font-mono text-teal-400 uppercase font-bold tracking-wider">Ecological Buffer</div>
                  <div className="text-xl font-bold font-serif text-[#E1E0CC] mt-1">Ward S (Bhandup / SGNP)</div>
                  <div className="text-3xl font-mono font-bold text-teal-400 mt-3">30.0°C <span className="text-xs font-sans text-[#E1E0CC]/60 font-normal">Mean LST</span></div>
                  <div className="mt-4 space-y-1.5 text-xs text-[#E1E0CC]/70 font-mono">
                    <div className="flex justify-between"><span>NDVI (Greenery):</span><span className="text-teal-400 font-bold">0.48</span></div>
                    <div className="flex justify-between"><span>NDBI (Built-up):</span><span className="text-teal-400 font-bold">-0.05</span></div>
                    <div className="flex justify-between"><span>Cooling Buffer:</span><span className="text-teal-400 font-bold">-6.2°C</span></div>
                  </div>
                </div>

              </div>

              <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/5 text-xs text-[#E1E0CC]/70 leading-relaxed">
                <span className="font-bold text-[#E1E0CC]">Thermodynamic Implication:</span> Surface heat differentials translate into a 22–38% increase in localized residential energy consumption and direct public health vulnerability during May and October peak heat waves.
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 5: HOW THE PLATFORM WORKS (METHODOLOGY) ─────────────── */}
      <section id="pipeline" className="py-20 px-6 bg-[#0e0f12] border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-[#D94E34] mb-2">Scientific Architecture</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#E1E0CC]">
              From Raw Satellite Photons to Explainable AI.
            </h2>
            <p className="mt-3 text-sm text-[#E1E0CC]/70">
              An end-to-end, reproducible computational pipeline built upon peer-reviewed thermodynamic principles and spatial machine learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#D94E34]/20 border border-[#D94E34]/40 flex items-center justify-center font-mono font-bold text-sm text-[#D94E34] mb-4">
                  01
                </div>
                <h3 className="font-serif font-semibold text-lg text-[#E1E0CC]">Satellite Radiometry</h3>
                <p className="text-xs text-[#E1E0CC]/70 mt-2 leading-relaxed">
                  Ingests calibrated USGS Landsat-8/9 OLI and TIRS Band 10 Top-of-Atmosphere spectral radiances.
                </p>
                <div className="my-3 p-2.5 rounded-lg bg-black/50 border border-white/10 font-mono text-[11px] text-amber-300">
                  L<sub className="text-[9px]">λ</sub> = M<sub className="text-[9px]">L</sub> · Q<sub className="text-[9px]">cal</sub> + A<sub className="text-[9px]">L</sub>
                </div>
              </div>
              <div className="pt-3 border-t border-white/10 text-[11px] font-mono text-[#E1E0CC]/50">
                Resolution: 100m TIR · Epochs: 2014–2024
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-mono font-bold text-sm text-amber-400 mb-4">
                  02
                </div>
                <h3 className="font-serif font-semibold text-lg text-[#E1E0CC]">Planck LST Retrieval</h3>
                <p className="text-xs text-[#E1E0CC]/70 mt-2 leading-relaxed">
                  Computes Land Surface Emissivity (ε) via FVC and inverts Planck for atmospheric-corrected temperature.
                </p>
                <div className="my-3 p-2.5 rounded-lg bg-black/50 border border-white/10 font-mono text-[11px] text-amber-300">
                  T<sub className="text-[9px]">s</sub> = K<sub className="text-[9px]">2</sub> / ln(ε · K<sub className="text-[9px]">1</sub> / L + 1)
                </div>
              </div>
              <div className="pt-3 border-t border-white/10 text-[11px] font-mono text-[#E1E0CC]/50">
                Atmospheric Split Window Correction
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center font-mono font-bold text-sm text-teal-400 mb-4">
                  03
                </div>
                <h3 className="font-serif font-semibold text-lg text-[#E1E0CC]">30m Spatial Downscaling</h3>
                <p className="text-xs text-[#E1E0CC]/70 mt-2 leading-relaxed">
                  XGBoost and Random Forest regression models downscale thermal fields using 30m multispectral predictors.
                </p>
                <div className="my-3 p-2.5 rounded-lg bg-black/50 border border-white/10 font-mono text-[11px] text-teal-300">
                  T̂<sub className="text-[9px]">30m</sub> = f<sub className="text-[9px]">XGB</sub>(NDVI, NDBI, α, DEM)
                </div>
              </div>
              <div className="pt-3 border-t border-white/10 text-[11px] font-mono text-[#E1E0CC]/50">
                Accuracy: R² = 0.94 · RMSE = 2.05°C
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center font-mono font-bold text-sm text-blue-400 mb-4">
                  04
                </div>
                <h3 className="font-serif font-semibold text-lg text-[#E1E0CC]">TreeSHAP XAI & What-If</h3>
                <p className="text-xs text-[#E1E0CC]/70 mt-2 leading-relaxed">
                  Decomposes exact biophysical contributions (±°C) for each ward and simulates urban greening under 100ms debouncing.
                </p>
                <div className="my-3 p-2.5 rounded-lg bg-black/50 border border-white/10 font-mono text-[11px] text-blue-300">
                  ΔT = ∑ ϕ<sub className="text-[9px]">i</sub> · Δx<sub className="text-[9px]">i</sub>
                </div>
              </div>
              <div className="pt-3 border-t border-white/10 text-[11px] font-mono text-[#E1E0CC]/50">
                Game Theory: Lundberg & Lee (2017)
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── SECTION 6: INTERACTIVE HEAT MAP PREVIEW ─────────────────────── */}
      <section id="preview" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#D94E34] mb-2">Live Ward Registry</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#E1E0CC]">
              24 BMC Administrative Wards At a Glance.
            </h2>
            <p className="text-sm text-[#E1E0CC]/70 mt-1">
              Select any ward below to inspect its live biophysical signature and thermal vulnerability profile.
            </p>
          </div>

          <button
            onClick={() => setActivePage('explorer')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D94E34] hover:bg-[#c2422b] text-white text-xs font-medium self-start md:self-end transition-all shadow-md cursor-pointer"
          >
            Open Full-Screen GIS Canvas
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ward Selector Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {WARDS_DATA.slice(0, 12).map((w) => (
            <button
              key={w.id}
              onClick={() => setPreviewWardId(w.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                previewWardId === w.id
                  ? 'bg-[#D94E34] text-white shadow-md font-bold'
                  : 'bg-white/[0.05] hover:bg-white/10 text-[#E1E0CC]/80 border border-white/10'
              }`}
            >
              Ward {w.id} ({w.name.split(' ')[0]})
            </button>
          ))}
        </div>

        {/* Selected Ward Telemetry Showcase */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-black/60 border border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-4">
              <div className="text-xs font-mono uppercase tracking-widest text-[#D94E34]">Selected Ward Profile</div>
              <h3 className="font-serif text-3xl font-bold text-[#E1E0CC] mt-1">
                Ward {previewWard.id}
              </h3>
              <div className="text-sm text-[#E1E0CC]/80 font-medium">{previewWard.name} ({previewWard.zone} Zone)</div>

              <div className="mt-6 space-y-3 font-mono text-xs">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-[#E1E0CC]/60">Population Density:</span>
                  <span className="font-bold text-[#E1E0CC]">{previewWard.popDensity.toLocaleString()} /km²</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-[#E1E0CC]/60">Geographic Area:</span>
                  <span className="font-bold text-[#E1E0CC]">{previewWard.area} km²</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-[#E1E0CC]/60">Thermal Risk Classification:</span>
                  <span className="font-bold text-[#D94E34]">{previewWard.risk}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedWard(previewWard);
                  setActivePage('studio');
                }}
                className="mt-6 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-[#E1E0CC] text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#D94E34]" />
                Simulate Interventions for Ward {previewWard.id}
              </button>
            </div>

            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              <div className="p-4 rounded-xl bg-black/50 border border-white/10">
                <div className="text-[11px] font-mono text-[#E1E0CC]/50">Mean Surface Temp</div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-[#D94E34] mt-1">
                  {previewWard.meanLst}°C
                </div>
                <div className="text-[10px] text-[#E1E0CC]/50 mt-1">Landsat-8/9 30m</div>
              </div>

              <div className="p-4 rounded-xl bg-black/50 border border-white/10">
                <div className="text-[11px] font-mono text-[#E1E0CC]/50">Vegetation Index (NDVI)</div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 mt-1">
                  {previewWard.ndvi}
                </div>
                <div className="text-[10px] text-[#E1E0CC]/50 mt-1">City Avg: 0.28</div>
              </div>

              <div className="p-4 rounded-xl bg-black/50 border border-white/10">
                <div className="text-[11px] font-mono text-[#E1E0CC]/50">Built-Up Density (NDBI)</div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-400 mt-1">
                  {previewWard.ndbi}
                </div>
                <div className="text-[10px] text-[#E1E0CC]/50 mt-1">Impervious Fraction</div>
              </div>

              <div className="p-4 rounded-xl bg-black/50 border border-white/10">
                <div className="text-[11px] font-mono text-[#E1E0CC]/50">Estimated Tree Cover</div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-teal-400 mt-1">
                  {(previewWard.ndvi * 65).toFixed(0)}%
                </div>
                <div className="text-[10px] text-[#E1E0CC]/50 mt-1">Canopy Fraction</div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 7: ANALYTICS & INSIGHTS ─────────────────────────────── */}
      <section className="py-20 px-6 bg-[#0e0f12] border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            
            <div className="lg:col-span-6 p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-[#D94E34] uppercase font-bold">Climatological Trend Analysis</div>
                <h3 className="font-serif text-2xl font-bold text-[#E1E0CC] mt-1">
                  28-Year Mann-Kendall Trend Test
                </h3>
                <p className="text-xs text-[#E1E0CC]/70 mt-2 leading-relaxed">
                  Analysis of continuous IMD Santacruz and Colaba weather records (1997–2024, N = 383,640) indicates a statistically significant urban heating trend that exacerbates localized surface heat islands.
                </p>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 font-mono">
                    <div className="text-[10px] text-[#E1E0CC]/50">Mann-Kendall Z</div>
                    <div className="text-lg font-bold text-[#D94E34]">+{MANN_KENDALL_METRICS.zStatistic}</div>
                    <div className="text-[9px] text-[#E1E0CC]/40">p = 3.64 × 10⁻⁵</div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 font-mono">
                    <div className="text-[10px] text-[#E1E0CC]/50">Sen’s Slope</div>
                    <div className="text-lg font-bold text-amber-400">+{MANN_KENDALL_METRICS.sensSlopeDecade}°C</div>
                    <div className="text-[9px] text-[#E1E0CC]/40">Per Decade Rate</div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 font-mono">
                    <div className="text-[10px] text-[#E1E0CC]/50">Total Shift</div>
                    <div className="text-lg font-bold text-teal-400">+{(MANN_KENDALL_METRICS.sensSlopeDecade * 2.8).toFixed(2)}°C</div>
                    <div className="text-[9px] text-[#E1E0CC]/40">1997–2024 Basin</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActivePage('science')}
                className="mt-6 inline-flex items-center gap-1.5 text-xs text-[#D94E34] font-semibold hover:underline cursor-pointer"
              >
                Inspect 28-Year Synoptic Matrix & Anomaly Heatmap →
              </button>
            </div>

            <div className="lg:col-span-6 p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-teal-400 uppercase font-bold">Spatial Machine Learning</div>
                <h3 className="font-serif text-2xl font-bold text-[#E1E0CC] mt-1">
                  Zero-Leakage Spatial Block K-Fold
                </h3>
                <p className="text-xs text-[#E1E0CC]/70 mt-2 leading-relaxed">
                  Conventional ML models overfit urban surfaces due to proximate pixel autocorrelation. We partition Mumbai into 5 spatial regional blocks with a 1.2 km dead-zone halo buffer.
                </p>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 font-mono">
                    <div className="text-[10px] text-[#E1E0CC]/50">Spatial Halo</div>
                    <div className="text-lg font-bold text-[#E1E0CC]">1.2 km</div>
                    <div className="text-[9px] text-[#E1E0CC]/40">Dead-Zone Isolation</div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 font-mono">
                    <div className="text-[10px] text-[#E1E0CC]/50">XGBoost RMSE</div>
                    <div className="text-lg font-bold text-teal-400">{MODEL_METRICS.xgboost.rmse}°C</div>
                    <div className="text-[9px] text-[#E1E0CC]/40">MAE: {MODEL_METRICS.xgboost.mae}°C</div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 font-mono">
                    <div className="text-[10px] text-[#E1E0CC]/50">Validation R²</div>
                    <div className="text-lg font-bold text-teal-400">{MODEL_METRICS.xgboost.r2}</div>
                    <div className="text-[9px] text-[#E1E0CC]/40">vs RF: {MODEL_METRICS.randomForest.r2}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActivePage('science')}
                className="mt-6 inline-flex items-center gap-1.5 text-xs text-teal-400 font-semibold hover:underline cursor-pointer"
              >
                Explore Spatial Block Geometry & TreeSHAP Attribution →
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ── SECTION 8: COOLING SOLUTIONS & ENERGY ROI ───────────────────── */}
      <section id="solutions" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-[#D94E34] mb-2">Municipal Interventions</div>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#E1E0CC]">
            5 Empirical Pathways to Sub-Zero Heat Islands.
          </h2>
          <p className="mt-3 text-sm text-[#E1E0CC]/70">
            Simulate realistic, policy-actionable urban modifications grounded in BMC DCPR 2034 development guidelines.
          </p>
        </div>

        {/* HVAC Energy Formula Block */}
        <div className="mb-10 max-w-3xl mx-auto p-4 rounded-2xl bg-black/60 border border-white/10 text-center font-mono">
          <div className="text-[10px] text-[#E1E0CC]/50 uppercase tracking-widest mb-1">Thermodynamic HVAC Cooling Conversion</div>
          <div className="text-base sm:text-lg font-serif text-teal-300 py-1">
            ΔE<sub className="text-xs font-mono">HVAC</sub> = η<sub className="text-xs font-mono">chiller</sub> · CDD<sub className="text-[10px] font-mono">18.3</sub> · β<sub className="text-[10px] font-mono">bldg</sub> · ΔT<sub className="text-xs font-mono">cooling</sub>  [kWh/m²/yr]
          </div>
          <div className="text-xs text-[#E1E0CC]/60 mt-1">
            Each 1.0°C surface cooling yields ~12.4 kWh/m²/yr annual air-conditioning savings across Mumbai commercial corridors.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {PRESET_SCENARIOS.map((sc, i) => (
            <div
              key={sc.name}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#D94E34]/50 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-[10px] text-[#D94E34] font-bold">0{i + 1}</span>
                <h4 className="font-serif font-bold text-base text-[#E1E0CC] mt-1">{sc.name}</h4>
                <p className="text-xs text-[#E1E0CC]/60 mt-2 leading-relaxed">{sc.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 font-mono text-xs space-y-1.5">
                <div className="flex justify-between text-teal-400 font-bold">
                  <span>Target Cooling:</span>
                  <span>-{(sc.deltaNdvi * 4.2 + sc.deltaAlbedo * 3.8).toFixed(2)}°C</span>
                </div>
                <div className="flex justify-between text-[#E1E0CC]/60">
                  <span>Albedo (Δα):</span>
                  <span>+{sc.deltaAlbedo}</span>
                </div>
                <div className="flex justify-between text-[#E1E0CC]/60">
                  <span>Canopy (ΔNDVI):</span>
                  <span>+{sc.deltaNdvi}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-[#D94E34]/15 via-black to-teal-500/15 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-serif font-bold text-lg text-[#E1E0CC]">Ready to run custom biophysical what-if experiments?</h4>
            <p className="text-xs text-[#E1E0CC]/70 mt-1">Adjust canopy, albedo, and depaving sliders dynamically with split-curtain before/after map visualization.</p>
          </div>
          <button
            onClick={() => setActivePage('studio')}
            className="px-6 py-2.5 rounded-full bg-[#D94E34] hover:bg-[#c2422b] text-white text-xs font-semibold whitespace-nowrap shadow-lg transition-all cursor-pointer"
          >
            Open Intervention Studio
          </button>
        </div>
      </section>

      {/* ── SECTION 9: TARGET USERS & STAKEHOLDERS ──────────────────────── */}
      <section className="py-20 px-6 bg-[#0e0f12] border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-[#D94E34] mb-2">Stakeholder Utility</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#E1E0CC]">
              Built for Municipal Planners, Researchers, and ESG Leaders.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <Building className="w-6 h-6 text-[#D94E34] mb-4" />
              <h4 className="font-serif font-bold text-base text-[#E1E0CC]">BMC Urban Planners</h4>
              <p className="text-xs text-[#E1E0CC]/70 mt-2 leading-relaxed">
                Inform Development Control and Promotion Regulations (DCPR 2034) with verifiable Ward-level cool roof and tree canopy mandates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <Cpu className="w-6 h-6 text-teal-400 mb-4" />
              <h4 className="font-serif font-bold text-base text-[#E1E0CC]">Atmospheric Scientists</h4>
              <p className="text-xs text-[#E1E0CC]/70 mt-2 leading-relaxed">
                Benchmark microclimate downscaling against 28 years of calibrated IMD synoptic records with zero spatial data leakage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <ShieldCheck className="w-6 h-6 text-amber-400 mb-4" />
              <h4 className="font-serif font-bold text-base text-[#E1E0CC]">Disaster Management</h4>
              <p className="text-xs text-[#E1E0CC]/70 mt-2 leading-relaxed">
                Target hyper-vulnerable heat wave corridors across informal settlements and optimize the deployment of emergency cooling centers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <Sparkles className="w-6 h-6 text-blue-400 mb-4" />
              <h4 className="font-serif font-bold text-base text-[#E1E0CC]">Real Estate & ESG</h4>
              <p className="text-xs text-[#E1E0CC]/70 mt-2 leading-relaxed">
                Quantify localized HVAC energy savings (kWh/m²/yr) and compute carbon offsets for IGBC and GRIHA green building certifications.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── SECTION 10: DATA & METHODOLOGY ──────────────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5">
            <div className="text-xs font-mono uppercase tracking-widest text-[#D94E34] mb-2">Scientific Transparency</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#E1E0CC]">
              Data Provenance & Rigorous Disclosure.
            </h2>
            <p className="text-sm text-[#E1E0CC]/70 mt-4 leading-relaxed">
              Every temperature value and TreeSHAP attribution bar on this platform traces back to open-access USGS satellite radiometry, IMD weather archives, and official BMC cartography.
            </p>

            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
              <span className="font-bold">Monsoon Limitation Disclosure:</span> During the southwest monsoon months (June–September), cloud cover obscures Landsat optical/TIR passes. Downscaling for these months incorporates IMD synoptic interpolation and SAR backscatter.
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-[#E1E0CC]/60">
                    <th className="py-3 px-4">Dataset</th>
                    <th className="py-3 px-4">Source Agency</th>
                    <th className="py-3 px-4">Resolution</th>
                    <th className="py-3 px-4">Temporal Epoch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[#E1E0CC]/80">
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#E1E0CC]">Landsat-8/9 TIRS & OLI</td>
                    <td className="py-3 px-4">USGS / NASA EarthExplorer</td>
                    <td className="py-3 px-4">30m (downscaled)</td>
                    <td className="py-3 px-4">2014–2024</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#E1E0CC]">Synoptic Weather Records</td>
                    <td className="py-3 px-4">India Meteorological Dept (IMD)</td>
                    <td className="py-3 px-4">Colaba & Santacruz</td>
                    <td className="py-3 px-4">1997–2024 (28 Yrs)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#E1E0CC]">Administrative Wards</td>
                    <td className="py-3 px-4">Brihanmumbai Municipal Corp</td>
                    <td className="py-3 px-4">24 Polygons</td>
                    <td className="py-3 px-4">DCPR 2034 GIS</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#E1E0CC]">Digital Elevation Model</td>
                    <td className="py-3 px-4">SRTM 1 Arc-Second Global</td>
                    <td className="py-3 px-4">30m Ground Post</td>
                    <td className="py-3 px-4">V3.0 Global</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 11: ABOUT THE RESEARCH PROJECT ───────────────────────── */}
      <section className="py-20 px-6 bg-[#0e0f12] border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-[#D94E34] mb-2">Research Mission</div>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#E1E0CC]">
            Bridging Academic Climate Science & Municipal Policy.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#E1E0CC]/75 leading-relaxed">
            The Mumbai Urban Heat Island AI Platform is an independent scientific research initiative engineered to provide decision-makers with open, reproducible, and sub-second microclimate telemetry. Built with clean TypeScript, Leaflet, and FastAPI, the codebase contains zero black-box simulations.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setActivePage('dossier')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D94E34] hover:bg-[#c2422b] text-white text-xs font-medium transition-all shadow-md cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              Generate Municipal Policy Dossier
            </button>
            <button
              onClick={() => setActivePage('science')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-[#E1E0CC] text-xs font-medium transition-all cursor-pointer"
            >
              <LineChart className="w-3.5 h-3.5" />
              View Validation Benchmarks
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 12: FAQS (ACCORDION) ────────────────────────────────── */}
      <section id="faqs" className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-mono uppercase tracking-widest text-[#D94E34] mb-2">Frequently Asked Questions</div>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#E1E0CC]">
            Technical & Policy Clarifications.
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif font-semibold text-sm sm:text-base text-[#E1E0CC] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#D94E34] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-5 pb-5 text-xs text-[#E1E0CC]/70 leading-relaxed border-t border-white/5 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 13: MUNICIPAL REFERENCE FOOTER ───────────────────────── */}
      <footer className="border-t border-white/10 bg-black py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#D94E34]" />
              <span className="font-serif font-bold text-base text-[#E1E0CC]">
                Mumbai Urban Heat Island Platform
              </span>
            </div>
            <p className="text-xs text-[#E1E0CC]/50 mt-1 max-w-md">
              AI-Driven 30m Microclimate & Thermal Radiance Workbench for Greater Mumbai. Compliant with BMC Climate Action Plan.
            </p>
            <div className="text-[11px] font-mono text-[#E1E0CC]/40 mt-3">
              CRS: EPSG:32643 (UTM Zone 43N) · Model: XGBoost + TreeSHAP · IMD 1997–2024
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#E1E0CC]/70 font-mono">
            <button onClick={() => setActivePage('explorer')} className="hover:text-white transition-colors cursor-pointer">
              [01] Spatial Explorer
            </button>
            <button onClick={() => setActivePage('studio')} className="hover:text-white transition-colors cursor-pointer">
              [02] Intervention Studio
            </button>
            <button onClick={() => setActivePage('science')} className="hover:text-white transition-colors cursor-pointer">
              [03] Climatology & ML
            </button>
            <button onClick={() => setActivePage('dossier')} className="hover:text-white transition-colors cursor-pointer">
              [04] Policy Dossiers
            </button>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#E1E0CC]/40 gap-4">
          <div>© 2026 Mumbai UHI Research Consortium. Open Science & Academic Initiative.</div>
          <div className="font-mono">Engine Status: Online (0ms Local Latency)</div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
