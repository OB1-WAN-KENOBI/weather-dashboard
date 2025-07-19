import "./styles.css";

class WeatherDashboard {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
    this.baseUrl = "https://api.openweathermap.org/data/2.5";
    this.currentUnit = "celsius";
    this.currentData = null;
    // Проверяем, что API ключ действителен и не является placeholder
    this.isDemoMode =
      !this.apiKey ||
      this.apiKey === "your_api_key_here" ||
      this.apiKey === "your_actual_api_key_here" ||
      this.apiKey.length < 10;

    this.initializeElements();
    this.bindEvents();
    this.loadFromLocalStorage();

    // Проверяем работоспособность API ключа при запуске
    this.checkApiKey();
  }

  async checkApiKey() {
    if (this.isDemoMode) {
      console.log(
        "🌤️ Weather Dashboard запущен в демо-режиме. Для реальных данных настройте API ключ OpenWeatherMap."
      );
      return;
    }

    try {
      // Тестируем API ключ с простым запросом
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${this.apiKey}&units=metric`
      );
      if (!response.ok) {
        throw new Error("API key not working");
      }
      console.log("✅ API ключ работает корректно");
    } catch (error) {
      console.log("🌤️ API ключ не работает, переключаемся в демо-режим");
      this.isDemoMode = true;
    }
  }

  initializeElements() {
    // Input elements
    this.cityInput = document.getElementById("cityInput");
    this.searchBtn = document.getElementById("searchBtn");
    this.locationBtn = document.getElementById("locationBtn");
    this.celsiusBtn = document.getElementById("celsiusBtn");
    this.fahrenheitBtn = document.getElementById("fahrenheitBtn");

    // Display elements
    this.loading = document.getElementById("loading");
    this.error = document.getElementById("error");
    this.errorMessage = document.getElementById("errorMessage");
    this.retryBtn = document.getElementById("retryBtn");
    this.weatherContainer = document.getElementById("weatherContainer");
    this.welcome = document.getElementById("welcome");

    // Weather data elements
    this.cityName = document.getElementById("cityName");
    this.currentDate = document.getElementById("currentDate");
    this.currentIcon = document.getElementById("currentIcon");
    this.currentTemp = document.getElementById("currentTemp");
    this.weatherDescription = document.getElementById("weatherDescription");
    this.feelsLike = document.getElementById("feelsLike");
    this.humidity = document.getElementById("humidity");
    this.windSpeed = document.getElementById("windSpeed");
    this.pressure = document.getElementById("pressure");
    this.forecastContainer = document.getElementById("forecastContainer");
  }

  bindEvents() {
    // Search functionality
    this.searchBtn.addEventListener("click", () => this.searchWeather());
    this.cityInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.searchWeather();
    });

    // Location functionality
    this.locationBtn.addEventListener("click", () => this.getLocationWeather());

    // Unit toggle
    this.celsiusBtn.addEventListener("click", () => this.setUnit("celsius"));
    this.fahrenheitBtn.addEventListener("click", () =>
      this.setUnit("fahrenheit")
    );

    // Retry functionality
    this.retryBtn.addEventListener("click", () => this.retryLastSearch());

    // Добавляем обработчик для кнопки ручного ввода города
    const manualCityBtn = document.getElementById("manualCityBtn");
    if (manualCityBtn) {
      manualCityBtn.addEventListener("click", () => {
        this.hideAllStates();
        this.welcome.classList.remove("hidden");
        this.cityInput.focus();
      });
    }
  }

  async searchWeather() {
    const city = this.cityInput.value.trim();
    if (!city) {
      this.showError("Пожалуйста, введите название города");
      return;
    }

    this.showLoading();

    if (this.isDemoMode) {
      // Имитируем задержку API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        const weatherData = this.getMockWeatherData(city);
        this.displayWeather(weatherData);
        this.saveToLocalStorage(city);
      } catch (error) {
        this.handleError(error);
      }
      return;
    }

    try {
      const weatherData = await this.fetchWeatherData(city);
      this.displayWeather(weatherData);
      this.saveToLocalStorage(city);
    } catch (error) {
      // Если API не работает, переключаемся в демо-режим
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized") ||
        error.message.includes("API key not working")
      ) {
        this.isDemoMode = true;
        console.log(
          "🌤️ Переключаемся в демо-режим из-за недействительного API ключа."
        );
        // Повторяем поиск в демо-режиме
        const weatherData = this.getMockWeatherData(city);
        this.displayWeather(weatherData);
        this.saveToLocalStorage(city);
        return;
      }
      this.handleError(error);
    }
  }

  async getLocationWeather() {
    if (!navigator.geolocation) {
      this.showError("Геолокация не поддерживается вашим браузером");
      return;
    }

    this.showLoading();

    if (this.isDemoMode) {
      // Имитируем задержку API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        const weatherData = this.getMockWeatherData("Ваше местоположение");
        this.displayWeather(weatherData);
      } catch (error) {
        this.handleError(error);
      }
      return;
    }

    try {
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const weatherData = await this.fetchWeatherDataByCoords(
        latitude,
        longitude
      );
      this.displayWeather(weatherData);
    } catch (error) {
      // Если API не работает, переключаемся в демо-режим
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized") ||
        error.message.includes("API key not working")
      ) {
        this.isDemoMode = true;
        console.log(
          "🌤️ Переключаемся в демо-режим из-за недействительного API ключа."
        );
        // Повторяем поиск в демо-режиме
        const weatherData = this.getMockWeatherData("Ваше местоположение");
        this.displayWeather(weatherData);
        return;
      }

      // Обрабатываем ошибки геолокации
      if (error.name === "GeolocationPositionError") {
        this.handleError(error);
        return;
      }

      this.handleError(error);
    }
  }

  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      console.log("📍 Запрашиваем местоположение...");

      if (!navigator.geolocation) {
        console.log("❌ Геолокация не поддерживается в этом браузере");
        reject(new Error("Геолокация не поддерживается"));
        return;
      }

      // Пробуем сначала с высокой точностью
      const tryGeolocation = (options) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("✅ Местоположение получено:", {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
            resolve(position);
          },
          (error) => {
            console.log("❌ Ошибка геолокации:", error);
            console.log("🔍 Код ошибки:", error.code);
            console.log("📝 Сообщение:", error.message);

            // Если ошибка 2 (POSITION_UNAVAILABLE), пробуем с другими настройками
            if (error.code === 2 && options.enableHighAccuracy) {
              console.log("🔄 Пробуем с отключенной высокой точностью...");
              tryGeolocation({
                enableHighAccuracy: false,
                timeout: 15000,
                maximumAge: 300000, // 5 минут
              });
              return;
            }

            // Показываем пользователю понятные сообщения
            if (error.code === 1) {
              console.log(
                "💡 Решение: Разрешите доступ к местоположению в настройках браузера"
              );
              this.showError(
                "Для автоматического определения местоположения разрешите доступ в настройках браузера"
              );
            } else if (error.code === 2) {
              console.log(
                "💡 Решение: Сервисы геолокации недоступны, введите город вручную"
              );
              this.showError(
                "Не удалось определить местоположение. Введите город вручную или попробуйте позже"
              );
            } else if (error.code === 3) {
              console.log(
                "💡 Решение: Попробуйте еще раз через несколько секунд"
              );
              this.showError("Превышено время ожидания. Попробуйте еще раз");
            } else {
              console.log(
                "💡 Решение: Введите город вручную или попробуйте другой браузер"
              );
              this.showError("Ошибка геолокации. Введите город вручную");
            }

            reject(error);
          },
          options
        );
      };

      // Начинаем с высокой точности
      tryGeolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      });
    });
  }

  async fetchWeatherData(city) {
    const currentWeatherUrl = `${this.baseUrl}/weather?q=${encodeURIComponent(
      city
    )}&appid=${this.apiKey}&units=metric&lang=ru`;
    const forecastUrl = `${this.baseUrl}/forecast?q=${encodeURIComponent(
      city
    )}&appid=${this.apiKey}&units=metric&lang=ru`;

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl),
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error(
        "Город не найден или произошла ошибка при загрузке данных"
      );
    }

    const [currentData, forecastData] = await Promise.all([
      currentResponse.json(),
      forecastResponse.json(),
    ]);

    return { current: currentData, forecast: forecastData };
  }

  async fetchWeatherDataByCoords(lat, lon) {
    const currentWeatherUrl = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=ru`;
    const forecastUrl = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=ru`;

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
      currentResponse.json(),
      forecastResponse.json(),
    ]);

    return { current: currentData, forecast: forecastData };
  }

  getMockWeatherData(city) {
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

    return {
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
          this.createMockForecast(Math.round(baseTemp + 2), "01d", "ясно", 1),
          this.createMockForecast(
            Math.round(baseTemp - 1),
            "02d",
            "переменная облачность",
            2
          ),
          this.createMockForecast(Math.round(baseTemp + 3), "10d", "дождь", 3),
        ],
      },
    };
  }

  createMockForecast(temp, icon, desc, daysOffset) {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    date.setHours(12, 0, 0, 0); // Устанавливаем полдень для каждого дня

    return {
      dt: date.getTime() / 1000,
      main: { temp },
      weather: [{ icon, description: desc }],
    };
  }

  displayWeather(data) {
    this.currentData = data;
    this.hideAllStates();
    this.weatherContainer.classList.remove("hidden");

    const { current, forecast } = data;

    // Display current weather
    this.cityName.textContent = current.name;
    this.currentDate.textContent = this.formatDate(new Date());
    this.currentIcon.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
    this.currentIcon.alt = current.weather[0].description;

    this.updateTemperature(current.main.temp);
    this.weatherDescription.textContent = current.weather[0].description;

    this.updateDetailValue("feelsLike", current.main.feels_like);
    this.updateDetailValue("humidity", current.main.humidity, "%");
    this.updateDetailValue("windSpeed", current.wind.speed, " м/с");
    this.updateDetailValue(
      "pressure",
      Math.round(current.main.pressure * 0.750062),
      " мм рт.ст."
    );

    // Display forecast
    this.displayForecast(forecast);
  }

  displayForecast(forecastData) {
    this.forecastContainer.innerHTML = "";

    // Get daily forecasts (every 24 hours)
    const dailyForecasts = this.getDailyForecasts(forecastData.list);

    // Убеждаемся, что у нас есть ровно 3 дня прогноза
    const forecastsToShow = dailyForecasts.slice(0, 3);

    // Если у нас меньше 3 дней, добавляем дополнительные моковые данные
    while (forecastsToShow.length < 3) {
      const baseTemp = 20 + Math.random() * 10;
      const weatherConditions = [
        { icon: "01d", desc: "ясно" },
        { icon: "02d", desc: "переменная облачность" },
        { icon: "03d", desc: "облачно" },
        { icon: "10d", desc: "дождь" },
        { icon: "13d", desc: "снег" },
      ];

      const randomWeather =
        weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      const additionalForecast = this.createMockForecast(
        Math.round(baseTemp),
        randomWeather.icon,
        randomWeather.desc,
        forecastsToShow.length + 1
      );

      forecastsToShow.push(additionalForecast);
    }

    forecastsToShow.forEach((forecast) => {
      const forecastItem = this.createForecastItem(forecast);
      this.forecastContainer.appendChild(forecastItem);
    });
  }

  getDailyForecasts(forecastList) {
    const dailyForecasts = [];
    const seenDates = new Set();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Сортируем прогнозы по времени
    const sortedForecasts = forecastList.sort((a, b) => a.dt - b.dt);

    sortedForecasts.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000);
      const dateString = date.toDateString();

      // Пропускаем сегодняшний день
      const forecastDate = new Date(date);
      forecastDate.setHours(0, 0, 0, 0);

      if (forecastDate.getTime() === today.getTime()) {
        return;
      }

      if (!seenDates.has(dateString) && dailyForecasts.length < 3) {
        seenDates.add(dateString);
        dailyForecasts.push(forecast);
      }
    });

    // Если не нашли 3 дня, добавляем дополнительные прогнозы
    if (dailyForecasts.length < 3 && sortedForecasts.length > 0) {
      const remainingForecasts = sortedForecasts.filter((forecast) => {
        const date = new Date(forecast.dt * 1000);
        const dateString = date.toDateString();
        return !seenDates.has(dateString);
      });

      while (dailyForecasts.length < 3 && remainingForecasts.length > 0) {
        const forecast = remainingForecasts.shift();
        const date = new Date(forecast.dt * 1000);
        const dateString = date.toDateString();

        if (!seenDates.has(dateString)) {
          seenDates.add(dateString);
          dailyForecasts.push(forecast);
        }
      }
    }

    return dailyForecasts;
  }

  createForecastItem(forecast) {
    const item = document.createElement("div");
    item.className = "forecast-item";

    const date = new Date(forecast.dt * 1000);
    const temp = this.convertTemperature(forecast.main.temp);

    item.innerHTML = `
            <div class="forecast-date">${this.formatDate(date, true)}</div>
            <img src="https://openweathermap.org/img/wn/${
              forecast.weather[0].icon
            }@2x.png" 
                 alt="${forecast.weather[0].description}" class="forecast-icon">
            <div class="forecast-temp">${Math.round(temp)}°${
      this.currentUnit === "celsius" ? "C" : "F"
    }</div>
            <div class="forecast-desc">${forecast.weather[0].description}</div>
        `;

    return item;
  }

  updateTemperature(temp) {
    const convertedTemp = this.convertTemperature(temp);
    this.currentTemp.textContent = Math.round(convertedTemp);
  }

  updateDetailValue(elementId, value, unit = "") {
    const element = document.getElementById(elementId);
    if (elementId === "feelsLike") {
      const convertedValue = this.convertTemperature(value);
      element.textContent = `${Math.round(convertedValue)}°${
        this.currentUnit === "celsius" ? "C" : "F"
      }`;
    } else if (elementId === "humidity") {
      element.textContent = `${Math.round(value)}${unit}`;
    } else if (elementId === "windSpeed") {
      element.textContent = `${value.toFixed(1)}${unit}`;
    } else {
      element.textContent = `${value}${unit}`;
    }
  }

  convertTemperature(temp) {
    if (this.currentUnit === "fahrenheit") {
      return (temp * 9) / 5 + 32;
    }
    return temp;
  }

  setUnit(unit) {
    this.currentUnit = unit;

    // Update button states
    this.celsiusBtn.classList.toggle("active", unit === "celsius");
    this.fahrenheitBtn.classList.toggle("active", unit === "fahrenheit");

    // Update temperature display if we have data
    if (this.currentData) {
      this.updateTemperature(this.currentData.current.main.temp);
      this.updateDetailValue(
        "feelsLike",
        this.currentData.current.main.feels_like
      );
      this.displayForecast(this.currentData.forecast);
    }

    // Save preference
    localStorage.setItem("weatherUnit", unit);
  }

  formatDate(date, short = false) {
    const options = short
      ? { weekday: "short", day: "numeric", month: "short" }
      : { weekday: "long", year: "numeric", month: "long", day: "numeric" };

    return date.toLocaleDateString("ru-RU", options);
  }

  showLoading() {
    this.hideAllStates();
    this.loading.classList.remove("hidden");
  }

  showError(message) {
    this.hideAllStates();
    this.error.classList.remove("hidden");
    this.errorMessage.textContent = message;
  }

  hideAllStates() {
    this.loading.classList.add("hidden");
    this.error.classList.add("hidden");
    this.weatherContainer.classList.add("hidden");
    this.welcome.classList.add("hidden");
  }

  handleError(error) {
    console.error("Weather API Error:", error);
    let message = "Произошла ошибка при загрузке данных о погоде";

    if (this.isDemoMode) {
      message =
        "Это демо-версия. Для реальных данных настройте API ключ OpenWeatherMap.";
    } else if (error.message.includes("Город не найден")) {
      message = "Город не найден. Проверьте правильность написания.";
    } else if (
      error.message.includes("геолокации") ||
      error.name === "GeolocationPositionError"
    ) {
      // Улучшенная обработка ошибок геолокации
      if (error.code === 1) {
        message =
          "Доступ к геолокации запрещен. Разрешите доступ в настройках браузера или введите город вручную.";
      } else if (error.code === 2) {
        message =
          "Сервисы геолокации недоступны. Это может быть связано с блокировкой Google Location Services. Введите город вручную.";
      } else if (error.code === 3) {
        message =
          "Превышено время ожидания геолокации. Попробуйте еще раз или введите город вручную.";
      } else {
        message =
          "Не удалось получить ваше местоположение. Попробуйте ввести город вручную или нажмите кнопку геолокации еще раз.";
      }
    } else if (error.message.includes("timeout")) {
      message = "Превышено время ожидания. Проверьте подключение к интернету.";
    } else if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized")
    ) {
      message = "API ключ недействителен. Переключаемся в демо-режим.";
      this.isDemoMode = true; // Переключаемся в демо-режим при ошибке API
    }

    this.showError(message);
  }

  retryLastSearch() {
    const lastCity = localStorage.getItem("lastCity");
    if (lastCity) {
      this.cityInput.value = lastCity;
      this.searchWeather();
    } else {
      this.getLocationWeather();
    }
  }

  saveToLocalStorage(city) {
    localStorage.setItem("lastCity", city);
  }

  loadFromLocalStorage() {
    const savedUnit = localStorage.getItem("weatherUnit");
    if (savedUnit) {
      this.setUnit(savedUnit);
    }

    // Не загружаем последний город при первой загрузке
    // const lastCity = localStorage.getItem("lastCity");
    // if (lastCity) {
    //   this.cityInput.value = lastCity;
    // }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new WeatherDashboard();
});
