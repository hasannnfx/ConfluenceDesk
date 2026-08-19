# Confluence Desk

Market Intelligence Dashboard — AO Divergence × Fibonacci.

## Prinsip perubahan
Project existing dipertahankan: indikator AO, Fibonacci, pivot, signal engine, chart canvas, education, bilingual UI, theme, dan navigasi tidak dihapus. Perubahan difokuskan pada UI/UX, market-data reliability, caching, security, PWA, mobile safe-area, dan news source.

## Market data
Backend memakai provider abstraction:

`MARKET_DATA_PROVIDER=twelvedata` → `TwelveDataProvider` → format OHLC standar → indikator/signal engine.

API key hanya di server: `TWELVEDATA_API_KEY`. Tidak ada fallback ke synthetic/demo data. Jika provider gagal dan cache server tersedia, response cached dipakai; jika tidak tersedia, UI menampilkan unavailable. HTTP 429 ditangani tanpa retry loop.

TTL server cache: M1 5s, M5 15s, M15 30s, M30 60s, H1 120s, H4 300s. Nilai dapat disesuaikan di `api/series.js`.

**Lisensi penting:** Twelve Data menyatakan external display/redistribution bergantung pada subscription tier/add-on/agreement. Karena dashboard ini publik, verifikasi hak display untuk plan yang digunakan sebelum production. Attribution juga diperlukan untuk public display pada kondisi yang berlaku.

## News
News backend diarahkan ke query `site:kontan.co.id` melalui RSS Google News dan hanya merender item yang mengidentifikasi source Kontan. Sistem news dipisahkan dari market data. Jika feed gagal, UI menampilkan `News temporarily unavailable.`

## PWA
Ditambahkan `manifest.webmanifest`, service worker, app icons 192/512, standalone display, theme/background color, iOS meta tags, safe-area spacing, dan install handling. Service worker hanya meng-cache app shell/static assets dan tidak menyimpan API key/credential. Market data tetap memerlukan internet.

## Environment
```env
TWELVEDATA_API_KEY=your_server_side_key_here
MARKET_DATA_PROVIDER=twelvedata
```

## Deploy
1. Push repository ke Git provider.
2. Deploy ke platform yang mendukung serverless Node functions dan HTTPS, misalnya Vercel.
3. Set `TWELVEDATA_API_KEY` dan `MARKET_DATA_PROVIDER` sebagai environment variables server.
4. Pastikan domain production adalah `https://www.hsnsf11h.my.id/` atau sesuaikan canonical/meta jika domain berubah.
5. Uji `/api/series` dan `/api/news` sebelum membuka dashboard publik.

## Mobile
iPhone: buka website di Safari → Share → Add to Home Screen → Add.
Android: gunakan Install / Add to Home Screen dari Chrome ketika prompt tersedia.
Desktop: gunakan Install di address bar bila browser mendukung.

## Existing logic retained
AO Divergence, Fibonacci, pivot sensitivity, Fibonacci tolerance, market structure/signal engine, timeframe flow, refresh, signal history, education, chart, existing API route names, settings persistence, dan disclaimer tetap dipertahankan. Formula signal engine tidak diubah dalam redesign ini.

## Known limitations
- Serverless in-memory cache dapat berbeda antar instance; `Cache-Control` membantu edge caching tetapi bukan shared persistent cache.
- Kontan RSS tidak diakses langsung; feed discovery memakai Google News dengan filter domain Kontan.
- Public Twelve Data display rights harus dipastikan sesuai plan/license.
- Candlestick/AO canvas existing tetap menjadi chart engine; redesign tidak mengganti library chart.

## Creator
Built by HSN · © 2026

## V2 UI upgrade
The V2 redesign preserves the existing API routes, indicator formulas, signal engine, chart canvas, education, news, PWA, settings and bilingual flow. The upgrade focuses on visual hierarchy, responsive terminal layout, state feedback, confidence/confluence presentation, accessibility, reduced motion and lightweight micro-interactions.
