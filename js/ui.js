/**
 * ui.js
 * Semua manipulasi DOM untuk dasbor: membangun panel instrumen dari
 * template, memperbarui gauge/badge/fib ladder/plan/mini-indikator,
 * mengelola log sinyal, dan modal pengaturan. Semua teks dinamis
 * diterjemahkan lewat I18N saat render (bukan dikunci ke satu bahasa).
 */
const UI = {
  panels: {},
  loggedKeys: new Set(),

  buildInstrumentPanels() {
    const grid = document.getElementById("instrumentGrid");
    const template = document.getElementById("instrumentTemplate");
    grid.innerHTML = "";
    this.panels = {};

    CONFIG.INSTRUMENTS.forEach((inst) => {
      const node = template.content.cloneNode(true);
      const panel = node.querySelector(".instrument-panel");
      panel.dataset.symbol = inst.id;
      panel.querySelector(".symbol-icon").textContent = inst.icon;
      panel.querySelector(".symbol-name").textContent = inst.label;
      panel.querySelector(".symbol-desc").textContent = inst.desc[I18N.lang] || inst.desc.id;
      grid.appendChild(node);
      this.panels[inst.id] = grid.querySelector(`[data-symbol="${inst.id}"]`);
    });
    I18N.applyStaticTranslations(grid);
  },

  /** Re-terjemahkan label statis di dalam panel (dipanggil saat ganti bahasa). */
  refreshPanelChrome() {
    Object.entries(this.panels).forEach(([id, panel]) => {
      const inst = CONFIG.INSTRUMENTS.find((i) => i.id === id);
      if (inst) panel.querySelector(".symbol-desc").textContent = inst.desc[I18N.lang] || inst.desc.id;
      I18N.applyStaticTranslations(panel);
    });
  },

  setConnectionStatus(state, i18nKey, vars) {
    const dot = document.getElementById("statusDot");
    const label = document.getElementById("statusText");
    dot.className = "status-dot " + state;
    label.textContent = I18N.t(i18nKey, vars);
  },

  setLastUpdate(date) {
    const el = document.getElementById("lastUpdate");
    el.textContent = I18N.t("lastUpdatePrefix", { time: date.toLocaleTimeString(I18N.lang === "id" ? "id-ID" : "en-US") });
  },

  renderInstrument(instId, result, meta) {
    const panel = this.panels[instId];
    if (!panel) return;

    const decimals = instId === "XAUUSD" ? 2 : instId === "BTCUSD" ? 1 : 5;

    panel.querySelector(".price-value").textContent = result.lastPrice.toFixed(decimals);
    const changeEl = panel.querySelector(".price-change");
    const changeSign = result.priceChangePct >= 0 ? "+" : "";
    changeEl.textContent = `${changeSign}${result.priceChangePct.toFixed(3)}%`;
    changeEl.className = "price-change " + (result.priceChangePct >= 0 ? "up" : "down");

    this._updateGauge(panel, result.score, result.signal);
    this._updateBadge(panel, result.signal);

    panel.querySelector(".score-value").textContent = result.score;

    const trendVal = panel.querySelector(".trend-value");
    if (result.trendUp === null) {
      trendVal.textContent = "—";
      trendVal.className = "mini-value trend-value";
    } else {
      trendVal.textContent = I18N.t(result.trendUp ? "trendUp" : "trendDown");
      trendVal.className = "mini-value trend-value " + (result.trendUp ? "up" : "down");
    }
    const rsiVal = panel.querySelector(".rsi-value");
    rsiVal.textContent = result.rsi !== null ? result.rsi.toFixed(1) : "—";
    rsiVal.className = "mini-value rsi-value" + (result.rsi !== null ? (result.rsi >= 70 ? " overbought" : result.rsi <= 30 ? " oversold" : "") : "");

    this._updateFibLadder(panel, result.fib, result.lastPrice, decimals);

    const list = panel.querySelector(".reasoning-list");
    list.innerHTML = "";
    result.reasons.forEach((r) => {
      const li = document.createElement("li");
      li.textContent = I18N.reason(r.key, r.vars);
      list.appendChild(li);
    });

    const plan = result.plan;
    panel.querySelector(".plan-entry").textContent = plan ? plan.entry.toFixed(decimals) : "—";
    panel.querySelector(".plan-sl").textContent = plan ? plan.stopLoss.toFixed(decimals) : "—";
    panel.querySelector(".plan-tp").textContent = plan ? plan.takeProfit.toFixed(decimals) : "—";
    panel.querySelector(".plan-rr").textContent = plan ? `1 : ${plan.riskReward.toFixed(2)}` : "—";

    Charts.drawPriceChart(panel.querySelector(".price-chart"), meta.candles, result.fib, result.signal);
    Charts.drawAOHistogram(panel.querySelector(".ao-chart"), result.ao);

    if (result.signal !== "neutral") {
      this._maybeLogSignal(instId, result, decimals);
    }
  },

  _updateGauge(panel, score, signal) {
    const direction = signal === "buy" ? 1 : signal === "sell" ? -1 : 0;
    const magnitude = score / 100;
    const position = direction * magnitude;

    const needle = panel.querySelector(".gauge-needle");
    const angle = position * 80;
    needle.style.transform = `rotate(${angle}deg)`;

    const fill = panel.querySelector(".gauge-fill");
    const dashTotal = 251.2;
    const filled = dashTotal * magnitude;
    fill.style.strokeDashoffset = String(dashTotal - filled);
    fill.style.stroke =
      signal === "buy" ? "var(--bull)" : signal === "sell" ? "var(--bear)" : "var(--neutral)";
  },

  _updateBadge(panel, signal) {
    const badge = panel.querySelector(".signal-badge");
    const text = panel.querySelector(".signal-badge-text");
    badge.dataset.state = signal;
    text.textContent = I18N.t(signal === "buy" ? "badgeBuy" : signal === "sell" ? "badgeSell" : "badgeNeutral");
  },

  _updateFibLadder(panel, fib, price, decimals) {
    const ladder = panel.querySelector(".fib-ladder");
    ladder.innerHTML = "";
    if (!fib) {
      const p = document.createElement("p");
      p.className = "log-empty";
      p.textContent = I18N.t("fibWaiting");
      ladder.appendChild(p);
      return;
    }
    const { level: nearest } = Indicators.nearestFibLevel(fib.levels, price);
    fib.levels
      .filter((l) => l.kind === "retracement")
      .forEach((lvl) => {
        const row = document.createElement("div");
        row.className = "fib-row" + (lvl === nearest ? " active" : "");
        row.innerHTML = `<span class="fib-pct">${(lvl.ratio * 100).toFixed(1)}%</span><span>${lvl.price.toFixed(decimals)}</span>`;
        ladder.appendChild(row);
      });
  },

  _maybeLogSignal(instId, result, decimals) {
    const key = `${instId}-${result.signal}-${result.fib.swingHighIndex}-${result.fib.swingLowIndex}`;
    if (this.loggedKeys.has(key)) return;
    this.loggedKeys.add(key);
    this.appendLogEntry({
      time: new Date(),
      symbol: instId,
      type: result.signal,
      note: I18N.reason(result.reasons[result.reasons.length - 1].key, result.reasons[result.reasons.length - 1].vars),
      price: result.lastPrice.toFixed(decimals),
    });
  },

  appendLogEntry(entry) {
    const log = document.getElementById("signalLog");
    const empty = log.querySelector(".log-empty");
    if (empty) empty.remove();

    const row = document.createElement("div");
    row.className = "log-entry";
    const typeLabel = I18N.t(entry.type === "buy" ? "gaugeBuy" : "gaugeSell");
    row.innerHTML = `
      <span class="log-time">${entry.time.toLocaleTimeString(I18N.lang === "id" ? "id-ID" : "en-US")}</span>
      <span class="log-symbol">${entry.symbol}</span>
      <span class="log-note"><span class="log-type ${entry.type}">${typeLabel}</span> — ${entry.note}</span>
      <span class="log-price">${entry.price}</span>
    `;
    log.prepend(row);

    while (log.children.length > 40) log.removeChild(log.lastChild);
  },

  // ---- Settings modal ----
  openSettingsModal() {
    document.getElementById("pivotInput").value = loadSetting(
      CONFIG.STORAGE_KEYS.pivotBars,
      CONFIG.DEFAULTS.pivotBars
    );
    document.getElementById("toleranceInput").value = loadSetting(
      CONFIG.STORAGE_KEYS.fibTolerance,
      CONFIG.DEFAULTS.fibTolerance
    );
    document.getElementById("settingsModal").classList.add("open");
  },

  closeSettingsModal() {
    document.getElementById("settingsModal").classList.remove("open");
  },

  // ---- View / sidebar navigation ----
  switchView(viewName) {
    document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.remove("hidden");

    document.querySelectorAll(".nav-item, .bottom-nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === viewName);
    });
  },
};
