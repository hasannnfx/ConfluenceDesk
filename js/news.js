/**
 * news.js
 * Mengambil dan merender berita pasar dari /api/news (proxy Google News RSS).
 * Jika proxy tidak tersedia (hosting statis tanpa serverless function),
 * menampilkan pesan yang mengarahkan pengguna ke pencarian Google News manual.
 */
const News = {
  timer: null,

  async load() {
    const list = document.getElementById("newsList");
    if (!list) return;
    list.innerHTML = `<p class="news-state">${I18N.t("newsLoading")}</p>`;

    try {
      const response = await fetch(`/api/news?lang=${I18N.lang}`);
      if (!response.ok) throw new Error("bad-response");
      const data = await response.json();
      if (!data.items || data.items.length === 0) {
        list.innerHTML = `<p class="news-state">${I18N.t("newsEmpty")}</p>`;
        return;
      }
      this.renderItems(data.items);
    } catch (err) {
      list.innerHTML = `
        <p class="news-state">${I18N.t("newsError")}</p>
      `;
    }
  },

  renderItems(items) {
    const list = document.getElementById("newsList");
    list.innerHTML = "";
    items.forEach((item) => {
      const card = document.createElement("a");
      card.className = "news-card";
      card.href = item.link;
      card.target = "_blank";
      card.rel = "noopener";

      const meta = document.createElement("div");
      meta.className = "news-meta";
      const source = document.createElement("span");
      source.className = "news-source";
      source.textContent = "KONTAN.CO.ID";
      const time = document.createElement("span");
      time.className = "news-time";
      time.textContent = this.formatDate(item.pubDate);
      meta.appendChild(source);
      meta.appendChild(time);

      const title = document.createElement("h3");
      title.textContent = item.title;

      const readMore = document.createElement("span");
      readMore.className = "news-readmore";
      readMore.textContent = I18N.t("newsReadMore") + " →";

      card.appendChild(meta);
      card.appendChild(title);
      card.appendChild(readMore);
      list.appendChild(card);
    });
  },

  formatDate(pubDate) {
    if (!pubDate) return "";
    const date = new Date(pubDate);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString(I18N.lang === "id" ? "id-ID" : "en-US", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  scheduleAutoRefresh() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.load(), CONFIG.NEWS.refreshMs);
  },
};
