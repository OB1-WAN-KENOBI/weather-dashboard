// Демо-версия с моковыми данными для тестирования без API ключа
class WeatherDashboardDemo {
  constructor() {
    this.currentUnit = "celsius";
    this.currentData = null;

    this.initializeElements();
    this.bindEvents();
    this.loadFromLocalStorage();
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
  }

  async searchWeather() {
    const city = this.cityInput.value.trim();
    if (!city) {
      this.showError("Пожалуйста, введите название города");
      return;
    }

    this.showLoading();

    // Имитируем задержку API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const weatherData = this.getMockWeatherData(city);
      this.displayWeather(weatherData);
      this.saveToLocalStorage(city);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getLocationWeather() {
    if (!navigator.geolocation) {
      this.showError("Геолокация не поддерживается вашим браузером");
      return;
    }

    this.showLoading();

    try {
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const weatherData = this.getMockWeatherData("Ваше местоположение");
      this.displayWeather(weatherData);
    } catch (error) {
      this.handleError(error);
    }
  }

  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      });
    });
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
          temp: baseTemp,
          feels_like: baseTemp - 2,
          humidity: 60 + Math.random() * 30,
          pressure: 1000 + Math.random() * 50,
        },
        weather: [
          {
            icon: currentWeather.icon,
            description: currentWeather.desc,
          },
        ],
        wind: {
          speed: 2 + Math.random() * 8,
        },
      },
      forecast: {
        list: [
          this.createMockForecast(baseTemp + 2, "01d", "ясно"),
          this.createMockForecast(baseTemp - 1, "02d", "переменная облачность"),
          this.createMockForecast(baseTemp + 3, "10d", "дождь"),
        ],
      },
    };
  }

  createMockForecast(temp, icon, desc) {
    return {
      dt: Date.now() / 1000 + Math.random() * 86400 * 3,
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
    this.updateDetailValue("humidity", Math.round(current.main.humidity), "%");
    this.updateDetailValue("windSpeed", current.wind.speed.toFixed(1), " м/с");
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

    forecastData.list.forEach((forecast) => {
      const forecastItem = this.createForecastItem(forecast);
      this.forecastContainer.appendChild(forecastItem);
    });
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
    console.error("Demo Error:", error);
    this.showError(
      "Это демо-версия. Для реальных данных нужен API ключ OpenWeatherMap."
    );
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

    const lastCity = localStorage.getItem("lastCity");
    if (lastCity) {
      this.cityInput.value = lastCity;
    }
  }
}

// Initialize the demo when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new WeatherDashboardDemo();
});
