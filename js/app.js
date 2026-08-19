/**
 * app.js
 * Titik masuk aplikasi: inisialisasi tema & bahasa, sidebar/bottom-nav,
 * loop refresh dashboard, dan wiring News/Education secara lazy (dimuat
 * saat pertama kali dibuka) supaya waktu muat awal tetap cepat.
 */
(function () {
  let refreshTimer = null;
  let isFetching = false;
  let resizeTimer = null;
  let newsLoaded = false;
  let deferredInstallPrompt = null;
  const lastResults = {};

  async function promptInstall() {
    if (!deferredInstallPrompt) {
      alert("iPhone: Share → Add to Home Screen → Add. Android/Desktop: gunakan opsi Install/Add to Home Screen browser.");
      return;
    }
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
  } // instId -> { result, candles }

  function getTimeframeConfig() {
    const value = document.getElementById("timeframeSelect").value;
    const tf = CONFIG.TIMEFRAMES.find((item) => item.value === value) || CONFIG.TIMEFRAMES.find((item) => item.value === CONFIG.DEFAULTS.timeframe);
    document.querySelectorAll(".terminal-timeframes span").forEach((el) => el.classList.toggle("active", el.textContent === tf.label));
    return tf;
  }

  function getSettings() {
    return {
      timeframe: getTimeframeConfig(),
      refreshMs: parseInt(document.getElementById("refreshSelect").value, 10),
      pivotBars: parseInt(loadSetting(CONFIG.STORAGE_KEYS.pivotBars, CONFIG.DEFAULTS.pivotBars), 10),
      fibTolerance: parseFloat(
        loadSetting(CONFIG.STORAGE_KEYS.fibTolerance, CONFIG.DEFAULTS.fibTolerance)
      ),
    };
  }

  async function refreshAll() {
    if (isFetching) return;
    isFetching = true;
    const settings = getSettings();
    const tf = settings.timeframe;
    const requestSize = Math.min(CONFIG.DEFAULTS.outputsize * tf.resample, 1000);

    UI.setConnectionStatus("pending", "statusLoadingLive");


    try {
      for (const inst of CONFIG.INSTRUMENTS) {
        const response = await TwelveDataAPI.fetchSeries(inst.td, tf.tdInterval, requestSize);
        const candles = Indicators.resampleCandles(response.candles, tf.resample);
        const result = SignalEngine.analyze(candles, {
          pivotBars: settings.pivotBars,
          fibTolerancePct: settings.fibTolerance,
        });
        UI.renderInstrument(inst.id, result, { candles });
        lastResults[inst.id] = { result, candles, cached: response.cached, lastUpdated: response.lastUpdated };
      }

      const hasCached = Object.values(lastResults).some(r => r.cached);
      UI.setConnectionStatus(hasCached ? "cached" : "live", hasCached ? "statusCached" : "statusLive");
      UI.setLastUpdate(new Date());
    } catch (err) {
      console.error(err);
      UI.setConnectionStatus("error", "statusApiError");
    } finally {
      isFetching = false;
    }
  }

  function scheduleAutoRefresh() {
    if (refreshTimer) clearInterval(refreshTimer);
    const ms = parseInt(document.getElementById("refreshSelect").value, 10);
    if (ms > 0) refreshTimer = setInterval(refreshAll, ms);
  }

  function redrawCharts() {
    Object.entries(lastResults).forEach(([instId, { result, candles }]) => {
      const panel = UI.panels[instId];
      if (!panel) return;
      Charts.drawPriceChart(panel.querySelector(".price-chart"), candles, result.fib, result.signal);
      Charts.drawAOHistogram(panel.querySelector(".ao-chart"), result.ao);
    });
  }

  /** Re-render panel dashboard yang sudah ada di cache tanpa fetch ulang (dipakai saat ganti bahasa/tema). */
  function rerenderCachedDashboard() {
    UI.refreshPanelChrome();
    Object.entries(lastResults).forEach(([instId, { result, candles }]) => {
      UI.renderInstrument(instId, result, { candles });
    });
  }

  function setLanguage(lang) {
    I18N.setLang(lang);
    saveSetting(CONFIG.STORAGE_KEYS.lang, lang);
    document.getElementById("langToggleLabel").textContent = I18N.t("langToggleLabel");
    I18N.applyStaticTranslations();
    Theme.apply(); // refresh theme button label text
    rerenderCachedDashboard();
    Education.render();
    if (newsLoaded) News.load();
  }

  function wireSidebarNav() {
    document.querySelectorAll(".nav-item, .bottom-nav-item").forEach((btn) => {
      if (btn.dataset.scroll) {
        btn.addEventListener("click", () => { document.getElementById("view-dashboard")?.classList.remove("hidden"); document.getElementById(btn.dataset.scroll)?.scrollIntoView({ behavior: "smooth", block: "start" }); });
        return;
      }
      if (!btn.dataset.view) return;
      btn.addEventListener("click", () => {
        UI.switchView(btn.dataset.view);
        if (btn.dataset.view === "education") Education.render();
        if (btn.dataset.view === "news" && !newsLoaded) {
          newsLoaded = true;
          News.load();
          News.scheduleAutoRefresh();
        }
      });
    });
    document.getElementById("bottomNavSettings").addEventListener("click", () => UI.openSettingsModal());
  }

  function wireEvents() {
    document.getElementById("refreshNow").addEventListener("click", refreshAll);
    document.getElementById("refreshSelect").addEventListener("change", scheduleAutoRefresh);
    document.getElementById("timeframeSelect").addEventListener("change", refreshAll);

    document.getElementById("openSettings").addEventListener("click", () => UI.openSettingsModal());
    document.getElementById("closeSettings").addEventListener("click", () => UI.closeSettingsModal());
    document.getElementById("settingsModal").addEventListener("click", (e) => {
      if (e.target.id === "settingsModal") UI.closeSettingsModal();
    });

    document.getElementById("saveSettings").addEventListener("click", () => {
        const pivot = document.getElementById("pivotInput").value;
      const tolerance = document.getElementById("toleranceInput").value;
      saveSetting(CONFIG.STORAGE_KEYS.pivotBars, pivot);
      saveSetting(CONFIG.STORAGE_KEYS.fibTolerance, tolerance);
      UI.closeSettingsModal();
      refreshAll();
    });

    document.getElementById("themeToggle").addEventListener("click", () => {
      Theme.toggle();
      redrawCharts(); // warna chart ikut tema baru tanpa fetch ulang
    });

    document.getElementById("langToggle").addEventListener("click", () => {
      setLanguage(I18N.lang === "id" ? "en" : "id");
    });

    document.getElementById("newsRefresh").addEventListener("click", () => News.load());
    window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredInstallPrompt = e; });
    document.getElementById("installApp").addEventListener("click", promptInstall);
    document.getElementById("installAppTop").addEventListener("click", promptInstall);
    document.querySelectorAll("[data-view='education']").forEach((btn) => btn.addEventListener("click", () => { UI.switchView("education"); Education.render(); }));

    wireSidebarNav();

    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(redrawCharts, 200);
    });
  }

  function init() {
    Theme.init();
    I18N.setLang(loadSetting(CONFIG.STORAGE_KEYS.lang, "id"));
    document.getElementById("langToggleLabel").textContent = I18N.t("langToggleLabel");
    I18N.applyStaticTranslations();

    UI.buildInstrumentPanels();
    Education.render();
    wireEvents();
    scheduleAutoRefresh();
    refreshAll();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
