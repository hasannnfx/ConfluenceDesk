/**
 * education.js
 * Modul "Belajar Trading dari Nol": daftar pelajaran ringkas bilingual (ID/EN)
 * yang menjelaskan dasar forex/gold trading sampai cara membaca dasbor ini.
 * Progres baca disimpan di localStorage lewat CONFIG.STORAGE_KEYS.lessonProgress.
 */
const Education = {
  lessons: [
    {
      id: "basics",
      title: { id: "Apa itu Forex & Trading Emas?", en: "What Is Forex & Gold Trading?" },
      body: {
        id: [
          "Forex adalah pasar tempat mata uang satu negara ditukar dengan mata uang negara lain, misalnya Euro (EUR) ditukar Dolar AS (USD) pada pasangan EUR/USD. Trading emas (XAU/USD) mirip konsepnya: Anda menukar nilai emas terhadap Dolar AS.",
          "Saat Anda 'BELI' (buy/long), Anda berharap harga naik lalu dijual lebih mahal. Saat Anda 'JUAL' (sell/short), Anda berharap harga turun lalu dibeli kembali lebih murah.",
          "Pasar ini buka hampir 24 jam pada hari kerja karena melibatkan bursa di berbagai zona waktu dunia (Asia, Eropa, Amerika).",
        ],
        en: [
          "Forex is the market where one country's currency is exchanged for another, e.g. Euro (EUR) for US Dollar (USD) on the EUR/USD pair. Gold trading (XAU/USD) works similarly: you're trading gold's value against the US Dollar.",
          "When you 'BUY' (go long), you expect the price to rise so you can sell higher later. When you 'SELL' (go short), you expect the price to fall so you can buy back cheaper.",
          "This market is open almost 24 hours on weekdays because it spans exchanges across different time zones (Asia, Europe, America).",
        ],
      },
    },
    {
      id: "pip-lot-leverage",
      title: { id: "Memahami Pip, Lot, dan Leverage", en: "Understanding Pip, Lot, and Leverage" },
      body: {
        id: [
          "Pip adalah satuan perubahan harga terkecil yang lazim dipakai, biasanya digit ke-4 di belakang koma untuk pasangan seperti EUR/USD (0.0001), dan digit ke-2 untuk XAU/USD (0.01).",
          "Lot adalah satuan ukuran posisi. 1 lot standar = 100.000 unit mata uang dasar. Broker biasanya juga menyediakan mini lot (0.1) dan micro lot (0.01) agar risiko lebih terkendali untuk pemula.",
          "Leverage memungkinkan Anda mengontrol posisi besar dengan modal kecil (mis. leverage 1:100 berarti modal $100 bisa mengontrol posisi $10.000). Leverage memperbesar potensi untung MAUPUN rugi — gunakan dengan sangat hati-hati.",
        ],
        en: [
          "A pip is the standard smallest price movement unit, usually the 4th decimal for pairs like EUR/USD (0.0001), and the 2nd decimal for XAU/USD (0.01).",
          "A lot is the position size unit. 1 standard lot = 100,000 units of the base currency. Brokers also offer mini lots (0.1) and micro lots (0.01) so beginners can keep risk manageable.",
          "Leverage lets you control a large position with small capital (e.g. 1:100 leverage means $100 can control a $10,000 position). Leverage magnifies BOTH potential profit and loss — use it very carefully.",
        ],
      },
    },
    {
      id: "support-resistance",
      title: { id: "Support & Resistance", en: "Support & Resistance" },
      body: {
        id: [
          "Support adalah area harga di mana tekanan beli cenderung muncul, menahan harga agar tidak turun lebih jauh. Resistance adalah kebalikannya: area di mana tekanan jual cenderung muncul, menahan harga agar tidak naik lebih jauh.",
          "Level ini terbentuk dari swing high/low sebelumnya — titik di mana harga pernah berbalik arah. Semakin sering suatu level diuji tanpa ditembus, semakin kuat level tersebut dianggap.",
          "Level Fibonacci (dibahas di pelajaran berikutnya) sebenarnya adalah cara sistematis untuk memperkirakan area support/resistance potensial di antara dua titik swing.",
        ],
        en: [
          "Support is a price area where buying pressure tends to appear, keeping price from falling further. Resistance is the opposite: an area where selling pressure tends to appear, keeping price from rising further.",
          "These levels form from previous swing highs/lows — points where price has reversed before. The more times a level is tested without breaking, the stronger it's considered.",
          "Fibonacci levels (covered in the next lesson) are actually a systematic way to estimate potential support/resistance zones between two swing points.",
        ],
      },
    },
    {
      id: "awesome-oscillator",
      title: { id: "Apa itu Awesome Oscillator (AO)?", en: "What Is the Awesome Oscillator (AO)?" },
      body: {
        id: [
          "Awesome Oscillator adalah indikator momentum yang dihitung dari selisih rata-rata bergerak sederhana (SMA) periode 5 dan periode 34 pada harga tengah (median price = (high+low)/2).",
          "Histogram AO berwarna hijau saat nilainya naik dibanding bar sebelumnya (momentum menguat), dan merah saat menurun (momentum melemah). AO membantu mengukur kekuatan/percepatan pergerakan harga, bukan arah harga itu sendiri.",
          "Di dasbor ini, AO dipakai bukan sekadar dilihat naik-turun, tapi dicari divergensinya terhadap harga — itulah yang menjadi pemicu utama sinyal.",
        ],
        en: [
          "The Awesome Oscillator is a momentum indicator calculated from the difference between a 5-period and 34-period simple moving average (SMA) of the median price ((high+low)/2).",
          "The AO histogram is green when its value rises compared to the previous bar (momentum strengthening), and red when it falls (momentum weakening). AO measures the strength/acceleration of price movement, not price direction itself.",
          "On this dashboard, AO isn't just read as up/down — its divergence against price is what's tracked, and that's the main trigger for signals.",
        ],
      },
    },
    {
      id: "divergence",
      title: { id: "Memahami Divergensi", en: "Understanding Divergence" },
      body: {
        id: [
          "Divergensi terjadi saat arah harga dan arah indikator (di sini: AO) tidak sejalan. Ini sering menjadi tanda peringatan awal bahwa momentum di balik tren sedang melemah.",
          "Divergensi Bullish: harga membuat low yang lebih rendah, tapi AO membuat low yang lebih tinggi. Artinya tekanan jual sebenarnya melemah meski harga masih turun — potensi pembalikan naik.",
          "Divergensi Bearish: harga membuat high yang lebih tinggi, tapi AO membuat high yang lebih rendah. Artinya tekanan beli melemah meski harga masih naik — potensi pembalikan turun.",
          "Divergensi lebih andal jika muncul di dekat level support/resistance atau Fibonacci penting — itulah kenapa dasbor ini mengombinasikan keduanya sebagai 'konfluensi'.",
        ],
        en: [
          "Divergence happens when price direction and an indicator's direction (here: AO) disagree. It's often an early warning sign that momentum behind the trend is weakening.",
          "Bullish Divergence: price makes a lower low, but AO makes a higher low. This means selling pressure is actually weakening even though price is still falling — a potential upward reversal.",
          "Bearish Divergence: price makes a higher high, but AO makes a lower high. This means buying pressure is weakening even though price is still rising — a potential downward reversal.",
          "Divergence is more reliable when it appears near an important support/resistance or Fibonacci level — which is why this dashboard combines both as 'confluence'.",
        ],
      },
    },
    {
      id: "fibonacci",
      title: { id: "Kalkulator Fibonacci Retracement", en: "Fibonacci Retracement Calculator" },
      body: {
        id: [
          "Level Fibonacci retracement (23.6%, 38.2%, 50%, 61.8%, 78.6%) adalah area di mana harga sering 'istirahat' atau berbalik arah sejenak sebelum melanjutkan tren utamanya, dihitung dari jarak antara satu swing low dan swing high.",
          "Level 50% dan 61.8% ('golden ratio') sering dianggap zona paling signifikan oleh banyak trader.",
          "Fibonacci extension (127.2%, 161.8%, 261.8%) dipakai untuk memperkirakan target take profit di luar swing awal, dengan asumsi tren berlanjut.",
          "Di dasbor ini, level Fibonacci dihitung otomatis dari swing pivot terbaru, dan dipakai sebagai 'zona konfirmasi' untuk divergensi AO.",
        ],
        en: [
          "Fibonacci retracement levels (23.6%, 38.2%, 50%, 61.8%, 78.6%) are areas where price often 'pauses' or briefly reverses before continuing its main trend, calculated from the distance between a swing low and swing high.",
          "The 50% and 61.8% ('golden ratio') levels are often considered the most significant zones by many traders.",
          "Fibonacci extensions (127.2%, 161.8%, 261.8%) are used to estimate take-profit targets beyond the original swing, assuming the trend continues.",
          "On this dashboard, Fibonacci levels are calculated automatically from the latest swing pivot, and used as a 'confirmation zone' for AO divergence.",
        ],
      },
    },
    {
      id: "risk-management",
      title: { id: "Manajemen Risiko & Money Management", en: "Risk Management & Money Management" },
      body: {
        id: [
          "Aturan paling penting: jangan pernah risiko lebih dari 1-2% modal Anda dalam satu transaksi. Ini melindungi akun Anda dari kerugian beruntun.",
          "Selalu gunakan Stop Loss. Ini adalah batas kerugian maksimum yang Anda terima jika analisis salah — bukan opsional, tapi wajib.",
          "Perhatikan rasio Risk:Reward. Rasio 1:2 artinya potensi profit dua kali lipat dari potensi rugi. Dengan rasio ini, Anda bisa tetap untung secara keseluruhan bahkan jika hanya menang 40% dari transaksi Anda.",
          "Jangan gunakan sinyal apa pun (termasuk dari dasbor ini) sebagai satu-satunya alasan entry. Sinyal adalah alat bantu analisis, bukan jaminan.",
        ],
        en: [
          "The most important rule: never risk more than 1-2% of your capital on a single trade. This protects your account from a losing streak.",
          "Always use a Stop Loss. This is the maximum loss you accept if your analysis is wrong — it's not optional, it's mandatory.",
          "Watch your Risk:Reward ratio. A 1:2 ratio means your potential profit is twice your potential loss. With this ratio, you can still be profitable overall even winning only 40% of your trades.",
          "Never use any signal (including from this dashboard) as your sole reason to enter a trade. A signal is an analysis aid, not a guarantee.",
        ],
      },
    },
    {
      id: "reading-dashboard",
      title: { id: "Cara Membaca Sinyal di Confluence Desk", en: "How to Read Signals on Confluence Desk" },
      body: {
        id: [
          "1) Lihat jarum gauge dan skor konfluensi — semakin dekat ke BELI/JUAL dan semakin tinggi skornya, semakin kuat konfluensi antar indikator.",
          "2) Baca daftar 'Alasan Sinyal' — di situ dijelaskan mengapa skor tersebut muncul: divergensi AO, posisi di level Fibonacci, keselarasan dengan trend EMA50/200, dan konfirmasi RSI.",
          "3) Perhatikan trend EMA — sinyal yang searah trend umumnya lebih diandalkan daripada sinyal yang melawan trend utama.",
          "4) Gunakan rencana trading (entry/SL/TP/RR) sebagai titik awal, bukan aturan mutlak — selalu sesuaikan dengan toleransi risiko Anda sendiri.",
          "5) Sinyal hanya muncul saat skor konfluensi ≥ 55/100 — di bawah itu, dasbor sengaja menahannya sebagai netral agar Anda tidak overtrading pada sinyal lemah.",
        ],
        en: [
          "1) Look at the gauge needle and confluence score — the closer to BUY/SELL and the higher the score, the stronger the confluence between indicators.",
          "2) Read the 'Signal Reasoning' list — it explains why that score appeared: AO divergence, position at a Fibonacci level, alignment with the EMA50/200 trend, and RSI confirmation.",
          "3) Watch the EMA trend — signals aligned with the trend are generally more reliable than signals going against the main trend.",
          "4) Use the trade plan (entry/SL/TP/RR) as a starting point, not an absolute rule — always adjust it to your own risk tolerance.",
          "5) Signals only appear when the confluence score is ≥ 55/100 — below that, the dashboard deliberately holds it as neutral so you don't overtrade on weak signals.",
        ],
      },
    },
  ],

  getProgress() {
    try {
      return JSON.parse(loadSetting(CONFIG.STORAGE_KEYS.lessonProgress, "[]"));
    } catch {
      return [];
    }
  },

  toggleDone(lessonId) {
    const progress = new Set(this.getProgress());
    if (progress.has(lessonId)) progress.delete(lessonId);
    else progress.add(lessonId);
    saveSetting(CONFIG.STORAGE_KEYS.lessonProgress, JSON.stringify([...progress]));
    return progress;
  },

  render() {
    const lang = I18N.lang;
    const container = document.getElementById("educationList");
    if (!container) return;
    const done = new Set(this.getProgress());

    document.getElementById("eduProgressText").textContent = I18N.t("eduProgress", {
      done: done.size,
      total: this.lessons.length,
    });
    const bar = document.getElementById("eduProgressBar");
    if (bar) bar.style.width = `${Math.round((done.size / this.lessons.length) * 100)}%`;

    container.innerHTML = "";
    this.lessons.forEach((lesson, idx) => {
      const isDone = done.has(lesson.id);
      const card = document.createElement("article");
      card.className = "lesson-card" + (isDone ? " done" : "");

      const num = document.createElement("span");
      num.className = "lesson-num";
      num.textContent = String(idx + 1).padStart(2, "0");

      const content = document.createElement("div");
      content.className = "lesson-content";

      const h3 = document.createElement("h3");
      h3.textContent = lesson.title[lang];

      const body = document.createElement("div");
      body.className = "lesson-body";
      lesson.body[lang].forEach((para) => {
        const p = document.createElement("p");
        p.textContent = para;
        body.appendChild(p);
      });

      const footer = document.createElement("div");
      footer.className = "lesson-footer";
      if (isDone) {
        const badge = document.createElement("span");
        badge.className = "lesson-done-badge";
        badge.textContent = "✓ " + I18N.t("eduDone");
        footer.appendChild(badge);
      }
      const btn = document.createElement("button");
      btn.className = "btn-ghost lesson-toggle";
      btn.type = "button";
      btn.textContent = I18N.t(isDone ? "eduMarkUndo" : "eduMarkDone");
      btn.addEventListener("click", () => {
        this.toggleDone(lesson.id);
        this.render();
      });
      footer.appendChild(btn);

      content.appendChild(h3);
      content.appendChild(body);
      content.appendChild(footer);
      card.appendChild(num);
      card.appendChild(content);
      container.appendChild(card);
    });
  },
};
