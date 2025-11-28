import type { WeatherData, CurrentWeather, ForecastData } from "../types";
import { getFromCache, saveToCache } from "./localStorage";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export const isDemoMode = (): boolean => {
  return (
    !API_KEY ||
    API_KEY === "your_api_key_here" ||
    API_KEY === "your_actual_api_key_here" ||
    API_KEY.length < 10
  );
};

export const fetchWeatherData = async (
  city: string,
  useCache = true
): Promise<WeatherData> => {
  if (isDemoMode()) {
    return getMockWeatherData(city);
  }

  const cacheKey = `city_${city.toLowerCase()}`;

  // Try cache first
  if (useCache) {
    const cached = getFromCache<WeatherData>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const currentWeatherUrl = `${BASE_URL}/weather?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=metric&lang=ru`;
  // Используем forecast endpoint - возвращает прогноз каждые 3 часа на 5 дней
  const forecastUrl = `${BASE_URL}/forecast?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=metric&lang=ru&cnt=40`; // cnt=40 дает ~5 дней прогноза

  const [currentResponse, forecastResponse] = await Promise.all([
    fetch(currentWeatherUrl),
    fetch(forecastUrl),
  ]);

  if (!currentResponse.ok || !forecastResponse.ok) {
    throw new Error("Город не найден или произошла ошибка при загрузке данных");
  }

  const [currentData, forecastData] = await Promise.all([
    currentResponse.json() as Promise<CurrentWeather>,
    forecastResponse.json() as Promise<ForecastData>,
  ]);

  // Валидация данных
  if (!currentData || !forecastData || !forecastData.list) {
    throw new Error("Некорректные данные от API");
  }

  // Сортируем прогнозы по времени (на случай, если API вернул не в порядке)
  if (forecastData.list.length > 0) {
    forecastData.list.sort((a, b) => a.dt - b.dt);
  }

  const weatherData: WeatherData = {
    current: currentData,
    forecast: forecastData,
  };

  // Save to cache
  saveToCache(cacheKey, weatherData);

  return weatherData;
};

export const fetchWeatherDataByCoords = async (
  lat: number,
  lon: number,
  useCache = true
): Promise<WeatherData> => {
  if (isDemoMode()) {
    return getMockWeatherData("Ваше местоположение");
  }

  const cacheKey = `coords_${lat.toFixed(2)}_${lon.toFixed(2)}`;

  // Try cache first
  if (useCache) {
    const cached = getFromCache<WeatherData>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const currentWeatherUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ru`;
  const forecastUrl = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ru&cnt=40`;

  const [currentResponse, forecastResponse] = await Promise.all([
    fetch(currentWeatherUrl),
    fetch(forecastUrl),
  ]);

  if (!currentResponse.ok || !forecastResponse.ok) {
    throw new Error(
      "Не удалось получить данные о погоде для вашего местоположения"
    );
  }

  const [currentData, forecastData] = await Promise.all([
    currentResponse.json() as Promise<CurrentWeather>,
    forecastResponse.json() as Promise<ForecastData>,
  ]);

  // Валидация данных
  if (!currentData || !forecastData || !forecastData.list) {
    throw new Error("Некорректные данные от API");
  }

  // Сортируем прогнозы по времени
  if (forecastData.list.length > 0) {
    forecastData.list.sort((a, b) => a.dt - b.dt);
  }

  const weatherData: WeatherData = {
    current: currentData,
    forecast: forecastData,
  };

  // Save to cache
  saveToCache(cacheKey, weatherData);

  return weatherData;
};

export const getMockWeatherData = (city: string): WeatherData => {
  const baseTemp = 20 + Math.random() * 10;
  const weatherConditions = [
    { icon: "01d", desc: "ясно" },
    { icon: "02d", desc: "переменная облачность" },
    { icon: "03d", desc: "облачно" },
    { icon: "10d", desc: "дождь" },
    { icon: "13d", desc: "снег" },
  ];

  const currentWeather =
    weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

  // Generate hourly forecast (24 hours) with realistic day/night cycle
  const hourlyList = [];
  const now = new Date();
  const currentHour = now.getHours();

  // Calculate min/max temps for the day (more realistic)
  const dayMaxTemp = baseTemp + 5 + Math.random() * 5; // Day max
  const nightMinTemp = baseTemp - 5 - Math.random() * 5; // Night min

  for (let i = 0; i < 24; i++) {
    const hourDate = new Date(now);
    hourDate.setHours(now.getHours() + i, 0, 0, 0);
    const hour = (currentHour + i) % 24;

    // Realistic temperature curve: lower at night (0-6, 20-23), higher during day (10-16)
    let hourTemp;
    if (hour >= 6 && hour < 10) {
      // Morning: rising
      hourTemp = nightMinTemp + (dayMaxTemp - nightMinTemp) * ((hour - 6) / 4);
    } else if (hour >= 10 && hour < 16) {
      // Day: warm
      hourTemp =
        dayMaxTemp -
        ((dayMaxTemp - nightMinTemp) * 0.1 * Math.abs(hour - 13)) / 3;
    } else if (hour >= 16 && hour < 20) {
      // Evening: cooling
      hourTemp = dayMaxTemp - (dayMaxTemp - nightMinTemp) * ((hour - 16) / 4);
    } else {
      // Night: cold
      hourTemp = nightMinTemp + (dayMaxTemp - nightMinTemp) * 0.2;
    }

    // Weather conditions based on time of day
    let hourWeather;
    if (hour >= 6 && hour < 20) {
      // Daytime icons
      hourWeather =
        weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    } else {
      // Nighttime - use night icons or clear
      const nightConditions = [
        { icon: "01n", desc: "ясно" },
        { icon: "02n", desc: "переменная облачность" },
        { icon: "03n", desc: "облачно" },
        { icon: "10n", desc: "дождь" },
        { icon: "13n", desc: "снег" },
      ];
      hourWeather =
        nightConditions[Math.floor(Math.random() * nightConditions.length)];
    }

    hourlyList.push({
      dt: Math.floor(hourDate.getTime() / 1000),
      main: {
        temp: Math.round(hourTemp * 10) / 10,
        feels_like: Math.round((hourTemp - 2) * 10) / 10,
        humidity: Math.round(60 + Math.random() * 30),
        pressure: Math.round(1000 + Math.random() * 50),
      },
      weather: [
        {
          icon: hourWeather.icon,
          description: hourWeather.desc,
        },
      ],
      wind: {
        speed: Math.round((2 + Math.random() * 8) * 10) / 10,
      },
      dt_txt: hourDate.toISOString(),
    });
  }

  const mockData = {
    current: {
      name: city,
      main: {
        temp: Math.round(baseTemp),
        feels_like: Math.round(baseTemp - 2),
        humidity: Math.round(60 + Math.random() * 30),
        pressure: Math.round(1000 + Math.random() * 50),
      },
      weather: [
        {
          icon: currentWeather.icon,
          description: currentWeather.desc,
        },
      ],
      wind: {
        speed: Math.round((2 + Math.random() * 8) * 10) / 10,
      },
    },
    forecast: {
      list: [
        ...hourlyList,
        createMockForecast(Math.round(baseTemp + 2), "01d", "ясно", 1),
        createMockForecast(
          Math.round(baseTemp - 1),
          "02d",
          "переменная облачность",
          2
        ),
        createMockForecast(Math.round(baseTemp + 3), "10d", "дождь", 3),
      ],
    },
  };

  return mockData;
};

const createMockForecast = (
  temp: number,
  icon: string,
  desc: string,
  daysOffset: number
) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(12, 0, 0, 0);

  return {
    dt: date.getTime() / 1000,
    main: { temp },
    weather: [{ icon, description: desc }],
  };
};
