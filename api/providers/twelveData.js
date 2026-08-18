class TwelveDataProvider {
  async fetchSeries({ symbol, interval, outputsize }) {
    const apiKey = process.env.TWELVEDATA_API_KEY;
    if (!apiKey) {
      const err = new Error('Missing TWELVEDATA_API_KEY');
      err.status = 500;
      throw err;
    }
    const url = new URL('https://api.twelvedata.com/time_series');
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('interval', interval);
    url.searchParams.set('outputsize', String(outputsize));
    url.searchParams.set('order', 'ASC');
    url.searchParams.set('apikey', apiKey);

    const upstream = await fetch(url.toString());
    const data = await upstream.json();
    if (upstream.status === 429 || data.code === 429 || /rate.?limit/i.test(data.message || data.status || '')) {
      const err = new Error('Twelve Data rate limit');
      err.status = 429;
      err.retryAfter = 30;
      throw err;
    }
    if (!upstream.ok || data.status === 'error' || data.code) {
      const err = new Error(data.message || data.error || 'Twelve Data error');
      err.status = upstream.status || 502;
      throw err;
    }
    if (!Array.isArray(data.values) || data.values.length === 0) {
      const err = new Error('No market data');
      err.status = 502;
      throw err;
    }
    return { values: data.values };
  }
}
module.exports = { TwelveDataProvider };
