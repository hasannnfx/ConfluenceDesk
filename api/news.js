/** KONTAN.CO.ID market/economic news via Google News RSS query restricted to Kontan. */
const ALLOWED_LANGS = new Set(['id', 'en']);
module.exports = async function handler(req, res) {
  const lang = ALLOWED_LANGS.has(req.query.lang) ? req.query.lang : 'id';
  const query = lang === 'id' ? 'site:kontan.co.id (ekonomi OR finansial OR pasar OR global OR komoditas OR forex OR emas)' : 'site:kontan.co.id (economy OR finance OR market OR global OR commodities OR forex OR gold)';
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${lang === 'id' ? 'id' : 'en-US'}&gl=ID&ceid=ID:${lang === 'id' ? 'id' : 'en'}`;
  try {
    const upstream = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ConfluenceDesk/2.0)' } });
    if (!upstream.ok) throw new Error('news-upstream');
    const xml = await upstream.text();
    const items = parseRssItems(xml).filter(x => /kontan/i.test(x.source || '')).slice(0, 12);
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    res.status(200).json({ items });
  } catch {
    res.status(502).json({ error: 'News temporarily unavailable.' });
  }
};
function decodeEntities(str) { return str.replace(/<!\[CDATA\[/g,'').replace(/\]\]>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim(); }
function extractTag(block, tag) { const m=block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`,'i')); return m ? decodeEntities(m[1]) : ''; }
function parseRssItems(xml) {
  return (xml.match(/<item>[\s\S]*?<\/item>/g)||[]).map(block=>({ title:extractTag(block,'title'), link:extractTag(block,'link'), pubDate:extractTag(block,'pubDate'), source:extractTag(block,'source') })).filter(x=>x.title&&x.link);
}
