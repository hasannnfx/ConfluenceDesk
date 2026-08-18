/**
 * api.js
 * Mengambil data candle lewat proxy server sendiri (/api/series), sehingga
 * API key TwelveData tidak pernah ada di sisi browser. Jika proxy tidak
 * tersedia (mis. hosting statis tanpa serverless function) atau mode demo
 * dipilih manual, otomatis jatuh ke data sintetis (DemoData).
 */
const TwelveDataAPI = {
  async fetchSeries(symbol, interval, outputsize) {
    const url = `/api/series?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&outputsize=${outputsize}`;
    let response;
    try { response = await fetch(url, { cache: "no-store" }); }
    catch { throw new ApiError("Market data temporarily unavailable.", "network"); }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = new ApiError(data.error || "Market data temporarily unavailable.", response.status === 429 ? "rate-limit" : "api");
      err.retryAfter = data.retryAfter;
      throw err;
    }
    if (!Array.isArray(data.values) || !data.values.length) throw new ApiError("No market data available.", "empty");
    return {
      candles: data.values.map(v => ({ time: new Date(v.datetime).getTime(), open: +v.open, high: +v.high, low: +v.low, close: +v.close, volume: v.volume == null ? null : +v.volume })).sort((a,b)=>a.time-b.time),
      cached: !!data.cached, lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : new Date(), provider: data.provider
    };
  }
};

class ApiError extends Error {
  constructor(message, kind, fallbackToDemo = false) {
    super(message);
    this.kind = kind;
    this.fallbackToDemo = fallbackToDemo;
  }
}

