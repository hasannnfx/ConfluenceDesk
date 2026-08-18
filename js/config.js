/**
 * config.js
 * Konfigurasi global: instrumen, timeframe, indikator, storage keys, berita.
 */
const CONFIG = {
  STORAGE_KEYS: {
    pivotBars: "cd_pivot_bars",
    fibTolerance: "cd_fib_tolerance",
    timeframe: "cd_timeframe",
    refreshMs: "cd_refresh_ms",
    demoMode: "cd_demo_mode",
    theme: "cd_theme",
    lang: "cd_lang",
    lessonProgress: "cd_lesson_progress",
  },

  // Instrumen yang dipantau. `td` adalah simbol yang dikenali TwelveData.
  // Daftar ini harus sinkron dengan ALLOWED_SYMBOLS di api/series.js.
  INSTRUMENTS: [
    { id: "XAUUSD", td: "XAU/USD", label: "XAU/USD", desc: { id: "Emas Spot vs Dolar AS", en: "Spot Gold vs US Dollar" }, icon: "Au" },
    { id: "EURUSD", td: "EUR/USD", label: "EUR/USD", desc: { id: "Euro vs Dolar AS", en: "Euro vs US Dollar" }, icon: "€$" },
    { id: "GBPUSD", td: "GBP/USD", label: "GBP/USD", desc: { id: "Poundsterling vs Dolar AS", en: "British Pound vs US Dollar" }, icon: "£$" },
    { id: "BTCUSD", td: "BTC/USD", label: "BTC/USD", desc: { id: "Bitcoin vs Dolar AS", en: "Bitcoin vs US Dollar" }, icon: "₿" },
  ],

  // Timeframe yang tersedia di selector. `tdInterval` adalah interval yang
  // diminta ke TwelveData; `resample` menggabungkan N candle asli menjadi 1
  // candle sintetis untuk interval yang tidak didukung native (mis. M3).
  TIMEFRAMES: [
    { value: "1min", label: "M1", tdInterval: "1min", resample: 1, stepMs: 60 * 1000 },
    { value: "5min", label: "M5", tdInterval: "5min", resample: 1, stepMs: 5 * 60 * 1000 },
    { value: "15min", label: "M15", tdInterval: "15min", resample: 1, stepMs: 15 * 60 * 1000 },
    { value: "30min", label: "M30", tdInterval: "30min", resample: 1, stepMs: 30 * 60 * 1000 },
    { value: "1h", label: "H1", tdInterval: "1h", resample: 1, stepMs: 60 * 60 * 1000 },
    { value: "4h", label: "H4", tdInterval: "4h", resample: 1, stepMs: 4 * 60 * 60 * 1000 },
  ],

  DEFAULTS: {
    timeframe: "1h",
    refreshMs: 60000,
    pivotBars: 4,
    fibTolerance: 0.35, // persen
    outputsize: 260, // cukup untuk EMA200 + buffer
  },

  // Level Fibonacci retracement + ekstensi yang dihitung dan ditampilkan.
  FIB_RETRACEMENTS: [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1],
  FIB_EXTENSIONS: [1.272, 1.618, 2.618],

  AO_FAST_PERIOD: 5,
  AO_SLOW_PERIOD: 34,
  RSI_PERIOD: 14,
  EMA_TREND_FAST: 50,
  EMA_TREND_SLOW: 200,

  SIGNAL_THRESHOLD: 55,

  NEWS: {
    refreshMs: 10 * 60 * 1000,
  },

  TWELVEDATA_BASE: "https://api.twelvedata.com",
};

function loadSetting(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
}

function saveSetting(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore storage errors (e.g. private browsing) */
  }
}
