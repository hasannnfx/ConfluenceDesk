/**
 * charts.js
 * Renderer chart ringan berbasis Canvas 2D murni — tanpa dependensi
 * library eksternal. Warna dibaca dari CSS custom properties saat setiap
 * render, sehingga otomatis mengikuti mode terang/gelap yang aktif.
 */
const Charts = {
  _themeColors() {
    const styles = getComputedStyle(document.documentElement);
    const c = (name, fallback) => (styles.getPropertyValue(name) || fallback).trim();
    return {
      textHi: c("--text-hi", "#eef0f4"),
      textLow: c("--text-low", "#6c7386"),
      gold: c("--gold", "#c9a24b"),
      goldLine: "rgba(201,162,75,0.22)",
      bull: c("--bull", "#3ecf8e"),
      bear: c("--bear", "#e85c51"),
      neutral: c("--neutral", "#7c8698"),
      gridLine: c("--hairline", "rgba(255,255,255,0.08)"),
    };
  },

  /** Menggambar garis harga penutupan + overlay level Fibonacci. */
  drawPriceChart(canvas, candles, fib, signal) {
    const ctx = canvas.getContext("2d");
    const { width, height } = this._prepCanvas(canvas);
    const colors = this._themeColors();
    ctx.clearRect(0, 0, width, height);

    const closes = candles.map((c) => c.close);
    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);
    let min = Math.min(...lows);
    let max = Math.max(...highs);
    if (fib) {
      min = Math.min(min, fib.swingLow);
      max = Math.max(max, fib.swingHigh);
    }
    const pad = (max - min) * 0.08 || 1;
    min -= pad;
    max += pad;

    const xFor = (i) => (i / (candles.length - 1)) * (width - 12) + 6;
    const yFor = (v) => height - ((v - min) / (max - min)) * (height - 16) - 8;

    if (fib) {
      ctx.font = "9px 'JetBrains Mono', monospace";
      fib.levels
        .filter((l) => l.kind === "retracement")
        .forEach((lvl) => {
          const y = yFor(lvl.price);
          ctx.strokeStyle = colors.goldLine;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = colors.gold;
          ctx.globalAlpha = 0.65;
          ctx.fillText(`${(lvl.ratio * 100).toFixed(1)}%`, width - 34, y - 2);
          ctx.globalAlpha = 1;
        });
    }

    ctx.beginPath();
    closes.forEach((c, i) => {
      const x = xFor(i);
      const y = yFor(c);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, colors.neutral);
    grad.addColorStop(1, signal === "buy" ? colors.bull : signal === "sell" ? colors.bear : colors.gold);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";
    ctx.stroke();

    ctx.lineTo(xFor(closes.length - 1), height);
    ctx.lineTo(xFor(0), height);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, 0, 0, height);
    fillGrad.addColorStop(0, "rgba(201,162,75,0.16)");
    fillGrad.addColorStop(1, "rgba(201,162,75,0)");
    ctx.fillStyle = fillGrad;
    ctx.fill();

    const lastX = xFor(closes.length - 1);
    const lastY = yFor(closes[closes.length - 1]);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = colors.textHi;
    ctx.fill();
  },

  /** Menggambar histogram Awesome Oscillator (hijau/merah sesuai momentum). */
  drawAOHistogram(canvas, ao) {
    const ctx = canvas.getContext("2d");
    const { width, height } = this._prepCanvas(canvas);
    const colors = this._themeColors();
    ctx.clearRect(0, 0, width, height);

    const values = ao.filter((v) => v !== null);
    if (values.length === 0) return;
    const maxAbs = Math.max(...values.map((v) => Math.abs(v))) || 1;
    const midY = height / 2;
    const barW = Math.max(1.5, (width - 12) / ao.length - 1);

    ao.forEach((v, i) => {
      if (v === null) return;
      const x = (i / (ao.length - 1)) * (width - 12) + 6;
      const barH = (Math.abs(v) / maxAbs) * (height / 2 - 6);
      const rising = i > 0 && ao[i - 1] !== null ? v > ao[i - 1] : true;
      ctx.fillStyle = rising ? colors.bull : colors.bear;
      ctx.globalAlpha = 0.9;
      if (v >= 0) ctx.fillRect(x, midY - barH, barW, barH);
      else ctx.fillRect(x, midY, barW, barH);
    });
    ctx.globalAlpha = 1;

    ctx.strokeStyle = colors.gridLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();
  },

  /** Menyesuaikan resolusi canvas dengan devicePixelRatio agar tajam. */
  _prepCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth || canvas.width;
    const cssHeight = canvas.clientHeight || canvas.height;
    if (canvas.width !== cssWidth * dpr || canvas.height !== cssHeight * dpr) {
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    return { width: cssWidth, height: cssHeight };
  },
};
