/** Secure market-data gateway with provider abstraction and server-side cache. */
const { TwelveDataProvider } = require('./providers/twelveData');

const ALLOWED_SYMBOLS = new Set(['XAU/USD', 'EUR/USD', 'GBP/USD', 'BTC/USD']);
const ALLOWED_INTERVALS = new Set(['1min', '5min', '15min', '30min', '1h', '4h', '1day']);
const CACHE_TTL_MS = { '1min': 5000, '5min': 15000, '15min': 30000, '30min': 60000, '1h': 120000, '4h': 300000, '1day': 900000 };
const memoryCache = new Map();

function providerFor(name) {
  switch ((name || 'twelvedata').toLowerCase()) {
    case 'twelvedata': return new TwelveDataProvider();
    default: throw new Error(`Unsupported market data provider: ${name}`);
  }
}

module.exports = async function handler(req, res) {
  const symbol = String(req.query.symbol || '').toUpperCase();
  const interval = String(req.query.interval || '1h');
  const outputsize = Math.min(Math.max(Number(req.query.outputsize || 260), 50), 1000);
  if (!ALLOWED_SYMBOLS.has(symbol) || !ALLOWED_INTERVALS.has(interval)) {
    res.status(400).json({ error: 'Invalid market-data request.' });
    return;
  }

  const providerName = process.env.MARKET_DATA_PROVIDER || 'twelvedata';
  const ttl = CACHE_TTL_MS[interval];
  const key = `${providerName}:${symbol}:${interval}:${outputsize}`;
  const now = Date.now();
  const cached = memoryCache.get(key);
  if (cached && now - cached.fetchedAt < ttl) {
    res.setHeader('Cache-Control', `public, s-maxage=${Math.ceil(ttl / 1000)}, stale-while-revalidate=${Math.ceil(ttl / 1000)}`);
    res.status(200).json({ ...cached.payload, cached: true, lastUpdated: cached.fetchedAt });
    return;
  }

  try {
    const provider = providerFor(providerName);
    const payload = await provider.fetchSeries({ symbol, interval, outputsize });
    const enriched = { ...payload, provider: providerName, source: 'market-data' };
    memoryCache.set(key, { fetchedAt: now, payload: enriched });
    res.setHeader('Cache-Control', `public, s-maxage=${Math.ceil(ttl / 1000)}, stale-while-revalidate=${Math.ceil(ttl / 1000)}`);
    res.status(200).json({ ...enriched, cached: false, lastUpdated: now });
  } catch (err) {
    if (cached) {
      res.setHeader('Cache-Control', `public, s-maxage=${Math.ceil(ttl / 1000)}, stale-while-revalidate=${Math.ceil(ttl / 1000)}`);
      res.status(200).json({ ...cached.payload, cached: true, lastUpdated: cached.fetchedAt, warning: 'cached-after-provider-error' });
      return;
    }
    const status = err.status === 429 ? 429 : 502;
    res.status(status).json({ error: status === 429 ? 'Market data rate limit reached.' : 'Market data temporarily unavailable.', retryAfter: err.retryAfter || Math.ceil(ttl / 1000) });
  }
};
