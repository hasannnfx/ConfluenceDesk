/**
 * indicators.js
 * Implementasi murni (tanpa dependensi eksternal) untuk:
 *  - Awesome Oscillator (AO) + divergensi
 *  - EMA (untuk filter trend) & RSI (untuk konfirmasi momentum)
 *  - Deteksi pivot swing high/low
 *  - Kalkulator level Fibonacci retracement & extension
 *  - Resampling candle (untuk timeframe sintetis seperti M3)
 */
const Indicators = {
  /** Simple Moving Average sederhana atas array angka. */
  sma(values, period, index) {
    if (index + 1 < period) return null;
    let sum = 0;
    for (let i = index - period + 1; i <= index; i++) sum += values[i];
    return sum / period;
  },

  /** Exponential Moving Average penuh atas array angka. Null sebelum cukup data. */
  ema(values, period) {
    const out = new Array(values.length).fill(null);
    if (values.length < period) return out;
    const k = 2 / (period + 1);
    let seed = 0;
    for (let i = 0; i < period; i++) seed += values[i];
    seed /= period;
    out[period - 1] = seed;
    for (let i = period; i < values.length; i++) {
      out[i] = values[i] * k + out[i - 1] * (1 - k);
    }
    return out;
  },

  /** Relative Strength Index (Wilder's smoothing). Null sebelum cukup data. */
  rsi(closes, period = 14) {
    const out = new Array(closes.length).fill(null);
    if (closes.length <= period) return out;

    let gainSum = 0;
    let lossSum = 0;
    for (let i = 1; i <= period; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) gainSum += diff;
      else lossSum -= diff;
    }
    let avgGain = gainSum / period;
    let avgLoss = lossSum / period;
    out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

    for (let i = period + 1; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    }
    return out;
  },

  /**
   * Awesome Oscillator: SMA(5) - SMA(34) dari median price (H+L)/2.
   * Mengembalikan array sepanjang candles, dengan null di titik yang belum cukup data.
   */
  awesomeOscillator(candles, fast = CONFIG.AO_FAST_PERIOD, slow = CONFIG.AO_SLOW_PERIOD) {
    const median = candles.map((c) => (c.high + c.low) / 2);
    const ao = [];
    for (let i = 0; i < candles.length; i++) {
      const fastSma = this.sma(median, fast, i);
      const slowSma = this.sma(median, slow, i);
      ao.push(fastSma !== null && slowSma !== null ? fastSma - slowSma : null);
    }
    return ao;
  },

  /**
   * Menemukan pivot high & low pada deret harga (high/low candle),
   * menggunakan jendela `lookback` bar di kiri dan kanan.
   */
  findPivots(candles, lookback = 4) {
    const highs = [];
    const lows = [];
    for (let i = lookback; i < candles.length - lookback; i++) {
      const windowSlice = candles.slice(i - lookback, i + lookback + 1);
      const isHigh = windowSlice.every((c) => candles[i].high >= c.high);
      const isLow = windowSlice.every((c) => candles[i].low <= c.low);
      if (isHigh) highs.push({ index: i, price: candles[i].high });
      if (isLow) lows.push({ index: i, price: candles[i].low });
    }
    return { highs, lows };
  },

  /**
   * Mendeteksi divergensi reguler antara dua pivot terakhir yang sejenis.
   *  - Bullish: harga Lower Low, AO Higher Low  -> potensi naik
   *  - Bearish: harga Higher High, AO Lower High -> potensi turun
   */
  detectDivergence(candles, ao, pivots) {
    const results = [];

    const lows = pivots.lows.filter((p) => ao[p.index] !== null);
    if (lows.length >= 2) {
      const [prev, last] = lows.slice(-2);
      const priceLL = last.price < prev.price;
      const aoHL = ao[last.index] > ao[prev.index];
      if (priceLL && aoHL) {
        results.push({ type: "bullish", fromIndex: prev.index, toIndex: last.index });
      }
    }

    const highs = pivots.highs.filter((p) => ao[p.index] !== null);
    if (highs.length >= 2) {
      const [prev, last] = highs.slice(-2);
      const priceHH = last.price > prev.price;
      const aoLH = ao[last.index] < ao[prev.index];
      if (priceHH && aoLH) {
        results.push({ type: "bearish", fromIndex: prev.index, toIndex: last.index });
      }
    }

    return results;
  },

  /**
   * Menentukan swing terakhir untuk basis kalkulator Fibonacci, lalu
   * menghitung level retracement & extension.
   */
  fibonacciFromSwing(candles, pivots) {
    if (pivots.highs.length === 0 || pivots.lows.length === 0) return null;

    const lastHigh = pivots.highs[pivots.highs.length - 1];
    const lastLow = pivots.lows[pivots.lows.length - 1];

    const trendUp = lastLow.index < lastHigh.index;
    const swingHigh = Math.max(lastHigh.price, lastLow.price);
    const swingLow = Math.min(lastHigh.price, lastLow.price);
    const range = swingHigh - swingLow;

    const retracements = CONFIG.FIB_RETRACEMENTS.map((ratio) => ({
      ratio,
      price: trendUp ? swingHigh - range * ratio : swingLow + range * ratio,
      kind: "retracement",
    }));

    const extensions = CONFIG.FIB_EXTENSIONS.map((ratio) => ({
      ratio,
      price: trendUp ? swingHigh - range * ratio : swingLow + range * ratio,
      kind: "extension",
    }));

    return {
      trendUp,
      swingHigh,
      swingLow,
      swingHighIndex: lastHigh.index,
      swingLowIndex: lastLow.index,
      levels: [...retracements, ...extensions].sort((a, b) => b.price - a.price),
    };
  },

  /** Mencari level Fibonacci terdekat dengan harga saat ini, dalam persen jarak. */
  nearestFibLevel(levels, price) {
    let nearest = null;
    let minDistPct = Infinity;
    for (const lvl of levels) {
      const distPct = (Math.abs(price - lvl.price) / price) * 100;
      if (distPct < minDistPct) {
        minDistPct = distPct;
        nearest = lvl;
      }
    }
    return { level: nearest, distancePct: minDistPct };
  },

  /**
   * Menggabungkan N candle berurutan menjadi 1 candle sintetis (dipakai untuk
   * timeframe yang tidak didukung native oleh penyedia data, mis. M3 dari M1).
   */
  resampleCandles(candles, factor) {
    if (!factor || factor <= 1) return candles;
    const out = [];
    for (let i = 0; i < candles.length; i += factor) {
      const chunk = candles.slice(i, i + factor);
      if (chunk.length === 0) continue;
      out.push({
        time: chunk[0].time,
        open: chunk[0].open,
        high: Math.max(...chunk.map((c) => c.high)),
        low: Math.min(...chunk.map((c) => c.low)),
        close: chunk[chunk.length - 1].close,
      });
    }
    return out;
  },
};
