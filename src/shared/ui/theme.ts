export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

const setDomTheme = (theme: "light" | "dark") => {
  document.documentElement.dataset.theme = theme;
};

export const getSystemTheme = () =>
  window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";

export const getSavedTheme = (): Theme | null => {
  const t = localStorage.getItem(STORAGE_KEY);
  return t === "light" || t === "dark" || t === "system" ? (t as Theme) : null;
};

export const applyTheme = (theme: Theme) => {
  localStorage.setItem(STORAGE_KEY, theme);

  if (theme === "system") {
    const media = window.matchMedia(MEDIA_QUERY);
    setDomTheme(getSystemTheme());
    media.onchange = () => setDomTheme(getSystemTheme());
  } else {
    setDomTheme(theme);
  }
};
