import type { TemperatureUnit } from "../types";

const LAST_CITY_KEY = "lastCity";
const WEATHER_UNIT_KEY = "weatherUnit";
const THEME_KEY = "theme";
const FAVORITES_KEY = "favoriteCities";
const SEARCH_HISTORY_KEY = "searchHistory";
const CACHE_KEY_PREFIX = "weather_cache_";

export const saveLastCity = (city: string): void => {
  localStorage.setItem(LAST_CITY_KEY, city);
};

export const getLastCity = (): string | null => {
  return localStorage.getItem(LAST_CITY_KEY);
};

export const saveTemperatureUnit = (unit: TemperatureUnit): void => {
  localStorage.setItem(WEATHER_UNIT_KEY, unit);
};

export const getTemperatureUnit = (): TemperatureUnit | null => {
  const unit = localStorage.getItem(WEATHER_UNIT_KEY);
  return unit === "celsius" || unit === "fahrenheit" ? unit : null;
};

export const saveTheme = (theme: "light" | "dark"): void => {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute("data-theme", theme);
};

export const getTheme = (): "light" | "dark" => {
  const theme = localStorage.getItem(THEME_KEY);
  return theme === "dark" ? "dark" : "light";
};

// Favorites
export const getFavorites = (): string[] => {
  const favorites = localStorage.getItem(FAVORITES_KEY);
  return favorites ? JSON.parse(favorites) : [];
};

export const addFavorite = (city: string): void => {
  const favorites = getFavorites();
  if (!favorites.includes(city)) {
    favorites.push(city);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
};

export const removeFavorite = (city: string): void => {
  const favorites = getFavorites();
  const filtered = favorites.filter((c) => c !== city);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
};

export const isFavorite = (city: string): boolean => {
  return getFavorites().includes(city);
};

// Search History
export const getSearchHistory = (): string[] => {
  const history = localStorage.getItem(SEARCH_HISTORY_KEY);
  return history ? JSON.parse(history) : [];
};

export const addToSearchHistory = (city: string): void => {
  const history = getSearchHistory();
  const filtered = history.filter((c) => c !== city);
  filtered.unshift(city);
  const limited = filtered.slice(0, 10); // Keep last 10
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(limited));
};

export const clearSearchHistory = (): void => {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
};

// Cache
interface CacheItem {
  data: unknown;
  timestamp: number;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const saveToCache = (key: string, data: unknown): void => {
  const cacheItem: CacheItem = {
    data,
    timestamp: Date.now(),
  };
  localStorage.setItem(`${CACHE_KEY_PREFIX}${key}`, JSON.stringify(cacheItem));
};

export const getFromCache = <T>(key: string): T | null => {
  const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${key}`);
  if (!cached) return null;

  try {
    const cacheItem: CacheItem = JSON.parse(cached);
    const now = Date.now();

    if (now - cacheItem.timestamp > CACHE_DURATION) {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${key}`);
      return null;
    }

    return cacheItem.data as T;
  } catch {
    return null;
  }
};
