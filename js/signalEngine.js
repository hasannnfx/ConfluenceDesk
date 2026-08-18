/**
 * signalEngine.js
 * Strategi konfluensi multi-indikator:
 *   1) Divergensi Awesome Oscillator (pemicu utama)
 *   2) Posisi harga terhadap level Fibonacci (zona konfirmasi)
 *   3) Filter trend EMA50 vs EMA200 (searah trend = skor naik, lawan trend = skor turun)
 *   4) Konfirmasi momentum RSI(14) (oversold/overbought relatif ke arah sinyal)
 *
 * Menghasilkan sinyal BUY / SELL / NEUTRAL, skor konfluensi 0-100, dan
 * rencana trading (entry, stop loss, take profit, risk:reward). Setiap
 * alasan direkam sebagai {key, vars} agar bisa diterjemahkan oleh i18n.js
 * saat dirender, bukan string bahasa yang dikunci di satu bahasa.
 */
const SignalEngine = {
  analyze(candles, opts) {
    const { pivotBars, fibTolerancePct } = opts;
    const closes = candles.map((c) => c.close);

    const ao = Indicators.awesomeOscillator(candles);
    const rsi = Indicators.rsi(closes, CONFIG.RSI_PERIOD);
    const emaFast = Indicators.ema(closes, CONFIG.EMA_TREND_FAST);
    const emaSlow = Indicators.ema(closes, CONFIG.EMA_TREND_SLOW);
    const pivots = Indicators.findPivots(candles, pivotBars);
    const divergences = Indicators.detectDivergence(candles, ao, pivots);
    const fib = Indicators.fibonacciFromSwing(candles, pivots);

    const lastPrice = candles[candles.length - 1].close;
    const prevPrice = candles[candles.length - 2]?.close ?? lastPrice;
    const lastRsi = rsi[rsi.length - 1];
    const lastEmaFast = emaFast[emaFast.length - 1];
    const lastEmaSlow = emaSlow[emaSlow.length - 1];
    const trendKnown = lastEmaFast !== null && lastEmaSlow !== null;
    const trendUp = trendKnown ? lastEmaFast > lastEmaSlow : null;

    const base = {
      lastPrice,
      priceChangePct: prevPrice ? ((lastPrice - prevPrice) / prevPrice) * 100 : 0,
      ao,
      rsi: lastRsi,
      trendUp,
      pivots,
      divergences,
      fib,
      signal: "neutral",
      score: 0,
      reasons: [],
      plan: null,
    };

    if (!fib || divergences.length === 0) {
      base.reasons.push({ key: divergences.length === 0 ? "no_divergence" : "not_enough_swing" });
      return base;
    }

    const { level: nearestLevel, distancePct } = Indicators.nearestFibLevel(fib.levels, lastPrice);
    const inZone = distancePct <= fibTolerancePct;

    const bullishDiv = divergences.find((d) => d.type === "bullish");
    const bearishDiv = divergences.find((d) => d.type === "bearish");

    let chosenDiv = null;
    if (bullishDiv && inZone) chosenDiv = bullishDiv;
    else if (bearishDiv && inZone) chosenDiv = bearishDiv;
    else if (bullishDiv || bearishDiv) chosenDiv = bullishDiv || bearishDiv;

    if (!chosenDiv) {
      base.reasons.push({ key: "no_confluence" });
      return base;
    }

    const direction = chosenDiv.type === "bullish" ? "buy" : "sell";

    base.reasons.push({
      key: "divergence_detail",
      vars: { direction, from: chosenDiv.fromIndex, to: chosenDiv.toIndex },
    });
    base.reasons.push({
      key: inZone ? "fib_zone_in" : "fib_zone_out",
      vars: {
        pct: (nearestLevel.ratio * 100).toFixed(1),
        distance: distancePct.toFixed(2),
        tolerance: fibTolerancePct,
      },
    });

    // --- Skor konfluensi dasar 0-100 ---
    let score = 40; // dasar: ada divergensi
    if (inZone) score += 35;
    else score += Math.max(0, 20 - distancePct * 5);
    if (divergences.length === 2) score += 10;
    if ([0.5, 0.618, 0.382].includes(nearestLevel.ratio)) score += 10;

    // --- Filter trend EMA50 vs EMA200 ---
    if (trendKnown) {
      const trendAligned = (direction === "buy" && trendUp) || (direction === "sell" && !trendUp);
      if (trendAligned) {
        score += 10;
        base.reasons.push({ key: "trend_align", vars: { direction } });
      } else {
        score -= 15;
        base.reasons.push({ key: "trend_against", vars: { direction } });
      }
    }

    // --- Konfirmasi momentum RSI(14) ---
    if (lastRsi !== null) {
      const rsiVal = Math.round(lastRsi * 10) / 10;
      if (direction === "buy") {
        if (lastRsi <= 45) {
          score += 8;
          base.reasons.push({ key: "rsi_support", vars: { rsi: rsiVal, direction } });
        } else if (lastRsi >= 70) {
          score -= 10;
          base.reasons.push({ key: "rsi_caution", vars: { rsi: rsiVal, direction } });
        }
      } else {
        if (lastRsi >= 55) {
          score += 8;
          base.reasons.push({ key: "rsi_support", vars: { rsi: rsiVal, direction } });
        } else if (lastRsi <= 30) {
          score -= 10;
          base.reasons.push({ key: "rsi_caution", vars: { rsi: rsiVal, direction } });
        }
      }
    }

    score = Math.max(0, Math.min(100, Math.round(score)));
    base.score = score;
    base.signal = score >= CONFIG.SIGNAL_THRESHOLD ? direction : "neutral";

    base.reasons.push({
      key: base.signal === "neutral" ? "score_neutral" : "score_signal",
      vars: { score, direction, threshold: CONFIG.SIGNAL_THRESHOLD },
    });

    if (base.signal !== "neutral") {
      base.plan = this.buildTradePlan(direction, lastPrice, fib);
    }

    return base;
  },

  /** Membangun rencana entry / stop loss / take profit berbasis level Fibonacci. */
  buildTradePlan(direction, price, fib) {
    const range = fib.swingHigh - fib.swingLow;
    const buffer = range * 0.08;

    let stopLoss, takeProfit;
    if (direction === "buy") {
      stopLoss = fib.swingLow - buffer;
      const ext = fib.levels.find((l) => l.kind === "extension") || { price: price + range * 1.272 };
      takeProfit = Math.max(ext.price, price + range * 0.5);
    } else {
      stopLoss = fib.swingHigh + buffer;
      const ext = fib.levels.find((l) => l.kind === "extension") || { price: price - range * 1.272 };
      takeProfit = Math.min(ext.price, price - range * 0.5);
    }

    const risk = Math.abs(price - stopLoss);
    const reward = Math.abs(takeProfit - price);
    const rr = risk > 0 ? reward / risk : 0;

    return { direction, entry: price, stopLoss, takeProfit, riskReward: rr };
  },
};
