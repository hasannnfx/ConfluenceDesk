/**
 * theme.js
 * Toggle mode terang/gelap, persisten di localStorage, diterapkan lewat
 * atribut [data-theme] di elemen <html> (dibaca oleh css/style.css).
 */
const Theme = {
  current: "dark",

  init() {
    this.current = loadSetting(CONFIG.STORAGE_KEYS.theme, "dark");
    this.apply();
  },

  apply() {
    document.documentElement.setAttribute("data-theme", this.current);
    const icon = document.getElementById("themeToggleIcon");
    const label = document.getElementById("themeToggleLabel");
    if (icon) icon.textContent = this.current === "dark" ? "☾" : "☀";
    if (label) label.textContent = I18N.t(this.current === "dark" ? "btnThemeToLight" : "btnThemeToDark");
  },

  toggle() {
    this.current = this.current === "dark" ? "light" : "dark";
    saveSetting(CONFIG.STORAGE_KEYS.theme, this.current);
    this.apply();
    return this.current;
  },
};
