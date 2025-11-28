import { useState, useEffect } from "react";
import type { WeatherData, TemperatureUnit } from "./types";
import { Header } from "./components/Header";
import { Loading } from "./components/Loading";
import { Error } from "./components/Error";
import { Welcome } from "./components/Welcome";
import { CurrentWeather } from "./components/CurrentWeather";
import { Forecast } from "./components/Forecast";
import { HourlyForecast } from "./components/HourlyForecast";
import { ToastContainer } from "./components/Toast";
import "./App.css";
import {
  fetchWeatherData,
  fetchWeatherDataByCoords,
  isDemoMode,
} from "./utils/weatherApi";
import { getCurrentPosition } from "./utils/geolocation";
import { getDailyForecasts } from "./utils/forecast";
import {
  saveLastCity,
  getLastCity,
  saveTemperatureUnit,
  getTemperatureUnit,
  saveTheme,
  getTheme,
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
} from "./utils/localStorage";

type AppState = "welcome" | "loading" | "error" | "weather";

interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
}

function App() {
  const [state, setState] = useState<AppState>("welcome");
  const [cityInput, setCityInput] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [unit, setUnit] = useState<TemperatureUnit>("celsius");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [forecastView, setForecastView] = useState<"daily" | "hourly">("daily");

  useEffect(() => {
    const savedUnit = getTemperatureUnit();
    if (savedUnit) {
      setUnit(savedUnit);
    }
    const savedTheme = getTheme();
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    setFavorites(getFavorites());
    setSearchHistory(getSearchHistory());
  }, []);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const loadWeatherData = async (
    fetchFn: () => Promise<WeatherData>,
    cityName?: string
  ) => {
    setState("loading");
    try {
      const data = await fetchFn();
      setWeatherData(data);
      setState("weather");
      setLastUpdated(new Date());
      if (cityName) {
        addToSearchHistory(cityName);
        setSearchHistory(getSearchHistory());
        showToast(`Погода для ${cityName} загружена`, "success");
      } else {
        showToast("Погода загружена", "success");
      }
    } catch (error) {
      handleError(error as Error);
    }
  };

  const handleSearch = async () => {
    const city = cityInput.trim();
    if (!city) {
      setErrorMessage("Пожалуйста, введите название города");
      setState("error");
      return;
    }

    await loadWeatherData(() => fetchWeatherData(city), city);
    saveLastCity(city);
  };

  const handleLocationClick = async () => {
    if (!navigator.geolocation) {
      setErrorMessage("Геолокация не поддерживается вашим браузером");
      setState("error");
      return;
    }

    await loadWeatherData(async () => {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      return fetchWeatherDataByCoords(latitude, longitude);
    });
  };

  const handleRefresh = async () => {
    if (!weatherData) return;

    const city = weatherData.current.name;
    await loadWeatherData(() => fetchWeatherData(city, false), city); // Force refresh
  };

  const handleError = (error: Error) => {
    let message = "Произошла ошибка при загрузке данных о погоде";

    if (isDemoMode()) {
      message =
        "Это демо-версия. Для реальных данных настройте API ключ OpenWeatherMap.";
    } else if (error.message.includes("Город не найден")) {
      message = "Город не найден. Проверьте правильность написания.";
    } else if (error.message.includes("timeout")) {
      message = "Превышено время ожидания. Проверьте подключение к интернету.";
    } else if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized")
    ) {
      message = "API ключ недействителен. Переключаемся в демо-режим.";
    }

    setErrorMessage(message);
    setState("error");
    showToast(message, "error");
  };

  const handleRetry = () => {
    const lastCity = getLastCity();
    if (lastCity) {
      setCityInput(lastCity);
      handleSearch();
    } else {
      handleLocationClick();
    }
  };

  const handleManualInput = () => {
    setState("welcome");
  };

  const handleUnitChange = (newUnit: TemperatureUnit) => {
    setUnit(newUnit);
    saveTemperatureUnit(newUnit);
  };

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const handleToggleFavorite = () => {
    if (!weatherData) return;

    const city = weatherData.current.name;
    if (isFavorite(city)) {
      removeFavorite(city);
      showToast(`${city} удален из избранного`, "info");
    } else {
      addFavorite(city);
      showToast(`${city} добавлен в избранное`, "success");
    }
    setFavorites(getFavorites());
  };

  const handleSelectCity = (city: string) => {
    setCityInput(city);
    // Auto search after a short delay
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setSearchHistory([]);
    showToast("История очищена", "info");
  };

  const renderContent = () => {
    switch (state) {
      case "loading":
        return <Loading />;
      case "error":
        return (
          <Error
            message={errorMessage}
            onRetry={handleRetry}
            onManualInput={handleManualInput}
          />
        );
      case "weather":
        if (!weatherData) return null;
        return (
          <div className="weather-container">
            <CurrentWeather
              weather={weatherData.current}
              unit={unit}
              isFavorite={isFavorite(weatherData.current.name)}
              onToggleFavorite={handleToggleFavorite}
              lastUpdated={lastUpdated || undefined}
              onRefresh={handleRefresh}
            />
            <div className="forecast-tabs">
              <button
                className={`forecast-tab ${
                  forecastView === "daily" ? "active" : ""
                }`}
                onClick={() => setForecastView("daily")}
              >
                На 3 дня
              </button>
              <button
                className={`forecast-tab ${
                  forecastView === "hourly" ? "active" : ""
                }`}
                onClick={() => setForecastView("hourly")}
              >
                На 48 часов
              </button>
            </div>
            {forecastView === "daily" ? (
              <Forecast
                forecasts={getDailyForecasts(weatherData.forecast.list)}
                unit={unit}
              />
            ) : (
              <>
                <HourlyForecast
                  forecasts={weatherData.forecast.list}
                  unit={unit}
                />
              </>
            )}
          </div>
        );
      default:
        return <Welcome />;
    }
  };

  return (
    <div className="container">
      <Header
        cityInput={cityInput}
        onCityInputChange={setCityInput}
        onSearch={handleSearch}
        onLocationClick={handleLocationClick}
        unit={unit}
        onUnitChange={handleUnitChange}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        searchHistory={searchHistory}
        favorites={favorites}
        onSelectCity={handleSelectCity}
        onClearHistory={handleClearHistory}
      />
      <main className="main">{renderContent()}</main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
