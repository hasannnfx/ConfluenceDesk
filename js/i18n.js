/**
 * i18n.js
 * Sistem terjemahan ringan (ID/EN) tanpa dependensi eksternal.
 * - I18N.t(key, vars)      -> string UI statis
 * - I18N.reason(key, vars) -> kalimat penjelasan sinyal (dinamis)
 * - I18N.applyStaticTranslations() -> menerjemahkan semua elemen [data-i18n] di DOM
 */
const I18N = {
  lang: "id",

  setLang(lang) {
    this.lang = lang === "en" ? "en" : "id";
  },

  t(key, vars) {
    const dict = this.strings[this.lang] || this.strings.id;
    let str = dict[key] !== undefined ? dict[key] : key;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), vars[k]);
      });
    }
    return str;
  },

  reason(key, vars) {
    const table = this.reasons[this.lang] || this.reasons.id;
    const fn = table[key];
    return fn ? fn(vars || {}) : key;
  },

  /** Menerjemahkan semua elemen dengan atribut data-i18n / data-i18n-placeholder / data-i18n-title. */
  applyStaticTranslations(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = this.t(el.getAttribute("data-i18n"));
    });
    root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", this.t(el.getAttribute("data-i18n-placeholder")));
    });
    root.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.setAttribute("title", this.t(el.getAttribute("data-i18n-title")));
    });
    document.documentElement.lang = this.lang;
  },

  strings: {
    id: {
      brandSub: "Mesin AO Divergence × Fibonacci",
      navDashboard: "Dasbor",
      navEducation: "Belajar Trading",
      navNews: "Berita",
      statusIdle: "Belum terhubung",
      statusLoadingDemo: "Menghubungkan ke market data…",
      statusLoadingLive: "Menghubungkan ke market data…",
      statusLive: "Market Data Connected",
      statusCached: "Cached Data",
      statusDemoManual: "Mode demo (dipilih manual)",
      statusFallbackDemo: "Proxy tidak tersedia — mode demo otomatis",
      statusApiError: "Terjadi kesalahan saat mengambil data.",
      btnSettings: "Pengaturan",
      btnThemeToLight: "Mode terang",
      btnThemeToDark: "Mode gelap",
      langToggleLabel: "EN",
      labelTimeframe: "Timeframe",
      labelRefresh: "Refresh",
      optRefreshManual: "Manual",
      opt30s: "30 detik",
      opt1m: "1 menit",
      opt5m: "5 menit",
      btnRefreshNow: "Tarik Data Terbaru",
      lastUpdateNone: "Belum ada data",
      lastUpdatePrefix: "Terakhir diperbarui: {time}",
      logTitle: "Riwayat Sinyal",
      logHint: "Sinyal baru muncul saat divergensi AO bertemu zona Fibonacci",
      logEmpty: "Belum ada sinyal tercatat pada sesi ini.",
      footerDisclaimer: "Analisis bersifat informatif dan bukan nasihat keuangan.",
      gaugeSell: "JUAL",
      gaugeNeutral: "NETRAL",
      gaugeBuy: "BELI",
      badgeAnalyzing: "Menganalisis…",
      badgeBuy: "SINYAL BELI",
      badgeSell: "SINYAL JUAL",
      badgeNeutral: "NETRAL / MENUNGGU",
      scoreLabel: "Skor Konfluensi",
      trendLabel: "Trend (EMA50/200)",
      trendUp: "Naik",
      trendDown: "Turun",
      rsiLabel: "RSI(14)",
      fibHeader: "Level Fibonacci",
      fibWaiting: "Menunggu data swing…",
      reasoningHeader: "Alasan Sinyal",
      planEntry: "Entry",
      planSL: "Stop Loss",
      planTP: "Take Profit",
      planRR: "Risk : Reward",
      modalTitle: "Pengaturan Analisis",
      modalDataSource: "Sumber Data",
      optLive: "Otomatis",
      optDemo: "Tidak digunakan",
      modalDataHint: "API key TwelveData dikelola di server (Environment Variable TWELVEDATA_API_KEY), bukan di browser, agar tidak terekspos publik. Lihat README.md untuk cara mengaturnya saat deploy. Jika proxy belum aktif, situs otomatis jatuh ke mode demo.",
      modalPivot: "Sensitivitas Pivot (bar kiri/kanan)",
      modalPivotHint: "Semakin kecil, semakin sensitif mendeteksi swing high/low untuk divergensi dan Fibonacci.",
      modalTolerance: "Toleransi Zona Fibonacci (%)",
      modalToleranceHint: "Jarak maksimum harga terkini ke level Fibonacci agar dianggap \"di dalam zona\".",
      btnSaveSettings: "Simpan & Muat Ulang",
      newsTitle: "Berita Pasar Terbaru",
      newsHint: "Berita ekonomi dan pasar dari KONTAN.CO.ID.",
      newsLoading: "Memuat berita…",
      newsEmpty: "Belum ada berita yang bisa ditampilkan saat ini.",
      newsError: "Gagal memuat berita. Coba tarik ulang beberapa saat lagi.",
      newsReadMore: "Baca selengkapnya",
      newsRefresh: "Muat Ulang Berita",
      eduTitle: "Belajar Trading dari Nol",
      eduHint: "Materi dasar sebelum mengandalkan sinyal — pahami dulu konsepnya, baru gunakan dasbor.",
      eduProgress: "{done} dari {total} pelajaran selesai",
      eduMarkDone: "Tandai Selesai",
      eduMarkUndo: "Batalkan Tanda Selesai",
      eduDone: "Selesai",
    },
    en: {
      brandSub: "AO Divergence × Fibonacci Engine",
      navDashboard: "Dashboard",
      navEducation: "Learn Trading",
      navNews: "News",
      statusIdle: "Not connected",
      statusLoadingDemo: "Connecting to market data…",
      statusLoadingLive: "Connecting to market data…",
      statusLive: "Market Data Connected",
      statusCached: "Cached Data",
      statusDemoManual: "Demo mode (manually selected)",
      statusFallbackDemo: "Proxy unavailable — automatic demo mode",
      statusApiError: "An error occurred while fetching data.",
      btnSettings: "Settings",
      btnThemeToLight: "Light mode",
      btnThemeToDark: "Dark mode",
      langToggleLabel: "ID",
      labelTimeframe: "Timeframe",
      labelRefresh: "Refresh",
      optRefreshManual: "Manual",
      opt30s: "30 seconds",
      opt1m: "1 minute",
      opt5m: "5 minutes",
      btnRefreshNow: "Pull Latest Data",
      lastUpdateNone: "No data yet",
      lastUpdatePrefix: "Last updated: {time}",
      logTitle: "Signal History",
      logHint: "New signals appear when AO divergence meets a Fibonacci zone",
      logEmpty: "No signals logged in this session yet.",
      footerDisclaimer: "Analysis is for informational purposes only and is not financial advice.",
      gaugeSell: "SELL",
      gaugeNeutral: "NEUTRAL",
      gaugeBuy: "BUY",
      badgeAnalyzing: "Analyzing…",
      badgeBuy: "BUY SIGNAL",
      badgeSell: "SELL SIGNAL",
      badgeNeutral: "NEUTRAL / WAITING",
      scoreLabel: "Confluence Score",
      trendLabel: "Trend (EMA50/200)",
      trendUp: "Up",
      trendDown: "Down",
      rsiLabel: "RSI(14)",
      fibHeader: "Fibonacci Levels",
      fibWaiting: "Waiting for swing data…",
      reasoningHeader: "Signal Reasoning",
      planEntry: "Entry",
      planSL: "Stop Loss",
      planTP: "Take Profit",
      planRR: "Risk : Reward",
      modalTitle: "Analysis Settings",
      modalDataSource: "Data Source",
      optLive: "Automatic",
      optDemo: "Not used",
      modalDataHint: "The TwelveData API key is managed server-side (Environment Variable TWELVEDATA_API_KEY), never in the browser, so it can't be exposed publicly. See README.md for setup during deployment. If the proxy isn't active, the site automatically falls back to demo mode.",
      modalPivot: "Pivot Sensitivity (left/right bars)",
      modalPivotHint: "Smaller values make swing high/low detection more sensitive for divergence and Fibonacci.",
      modalTolerance: "Fibonacci Zone Tolerance (%)",
      modalToleranceHint: "Maximum distance from the current price to a Fibonacci level to count as \"inside the zone\".",
      btnSaveSettings: "Save & Reload",
      newsTitle: "Latest Market News",
      newsHint: "Economic and market news from KONTAN.CO.ID.",
      newsLoading: "Loading news…",
      newsEmpty: "No news available to show right now.",
      newsError: "Failed to load news. Try refreshing again shortly.",
      newsReadMore: "Read more",
      newsRefresh: "Refresh News",
      eduTitle: "Learn Trading From Zero",
      eduHint: "Core concepts to learn before relying on signals — understand the theory, then use the dashboard.",
      eduProgress: "{done} of {total} lessons completed",
      eduMarkDone: "Mark as Done",
      eduMarkUndo: "Undo Mark as Done",
      eduDone: "Done",
    },
  },

  reasons: {
    id: {
      no_divergence: () => "Belum ada divergensi AO yang terbentuk pada swing terbaru.",
      not_enough_swing: () => "Belum cukup data swing untuk menghitung Fibonacci.",
      divergence_detail: ({ direction, from, to }) =>
        direction === "buy"
          ? `Harga membentuk low lebih rendah, namun AO membentuk low lebih tinggi antar bar #${from} dan #${to} (divergensi bullish).`
          : `Harga membentuk high lebih tinggi, namun AO membentuk high lebih rendah antar bar #${from} dan #${to} (divergensi bearish).`,
      fib_zone_in: ({ pct, distance }) =>
        `Harga berada dalam zona level Fibonacci ${pct}% (jarak ${distance}%).`,
      fib_zone_out: ({ pct, distance, tolerance }) =>
        `Level Fibonacci terdekat adalah ${pct}%, namun harga masih berjarak ${distance}% (di luar toleransi ${tolerance}%).`,
      trend_align: ({ direction }) =>
        `Trend utama (EMA50 vs EMA200) selaras dengan arah ${direction === "buy" ? "BELI" : "JUAL"} — keyakinan lebih tinggi.`,
      trend_against: ({ direction }) =>
        `Sinyal ${direction === "buy" ? "BELI" : "JUAL"} ini berlawanan dengan trend utama (EMA50/EMA200) — risiko lebih tinggi, pertimbangkan ukuran posisi lebih kecil.`,
      rsi_support: ({ rsi, direction }) =>
        `RSI(14) di ${rsi} mendukung sinyal ${direction === "buy" ? "beli (area oversold)" : "jual (area overbought)"}.`,
      rsi_caution: ({ rsi, direction }) =>
        `RSI(14) di ${rsi} berada di area ${direction === "buy" ? "overbought" : "oversold"} — waspada potensi koreksi sebelum entry ${direction === "buy" ? "beli" : "jual"}.`,
      score_neutral: ({ score, threshold }) =>
        `Skor konfluensi ${score}/100 — di bawah ambang batas ${threshold}, sinyal ditahan sebagai netral.`,
      score_signal: ({ score, direction }) =>
        `Skor konfluensi ${score}/100 — cukup kuat untuk sinyal ${direction === "buy" ? "BELI" : "JUAL"}.`,
      no_confluence: () => "Tidak ada konfluensi antara divergensi AO dan zona Fibonacci saat ini.",
    },
    en: {
      no_divergence: () => "No AO divergence has formed on the latest swings yet.",
      not_enough_swing: () => "Not enough swing data yet to calculate Fibonacci levels.",
      divergence_detail: ({ direction, from, to }) =>
        direction === "buy"
          ? `Price formed a lower low, but AO formed a higher low between bars #${from} and #${to} (bullish divergence).`
          : `Price formed a higher high, but AO formed a lower high between bars #${from} and #${to} (bearish divergence).`,
      fib_zone_in: ({ pct, distance }) =>
        `Price is inside the ${pct}% Fibonacci zone (distance ${distance}%).`,
      fib_zone_out: ({ pct, distance, tolerance }) =>
        `Nearest Fibonacci level is ${pct}%, but price is still ${distance}% away (outside the ${tolerance}% tolerance).`,
      trend_align: ({ direction }) =>
        `The main trend (EMA50 vs EMA200) aligns with the ${direction === "buy" ? "BUY" : "SELL"} direction — higher confidence.`,
      trend_against: ({ direction }) =>
        `This ${direction === "buy" ? "BUY" : "SELL"} signal goes against the main trend (EMA50/EMA200) — higher risk, consider a smaller position size.`,
      rsi_support: ({ rsi, direction }) =>
        `RSI(14) at ${rsi} supports the ${direction === "buy" ? "buy (oversold zone)" : "sell (overbought zone)"} signal.`,
      rsi_caution: ({ rsi, direction }) =>
        `RSI(14) at ${rsi} is in the ${direction === "buy" ? "overbought" : "oversold"} zone — watch for a possible pullback before entering ${direction === "buy" ? "long" : "short"}.`,
      score_neutral: ({ score, threshold }) =>
        `Confluence score ${score}/100 — below the ${threshold} threshold, signal held as neutral.`,
      score_signal: ({ score, direction }) =>
        `Confluence score ${score}/100 — strong enough for a ${direction === "buy" ? "BUY" : "SELL"} signal.`,
      no_confluence: () => "No confluence between AO divergence and a Fibonacci zone right now.",
    },
  },
};
