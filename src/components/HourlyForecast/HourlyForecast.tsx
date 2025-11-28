import React from "react";
import type { ForecastItem, TemperatureUnit } from "../../types";
import { convertTemperature } from "../../utils/temperature";
import "./HourlyForecast.css";

interface HourlyForecastProps {
  forecasts: ForecastItem[];
  unit: TemperatureUnit;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({
  forecasts,
  unit,
}) => {
  const now = new Date();
  now.setMinutes(0, 0, 0);

  // Фильтруем прогнозы на следующие 24-48 часов (каждые 3 часа)
  const threeHourlyForecasts = forecasts
    .filter((forecast) => {
      const forecastDate = new Date(forecast.dt * 1000);
      const hoursDiff =
        (forecastDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      // Показываем прогнозы на ближайшие 48 часов (16 прогнозов по 3 часа)
      return hoursDiff >= 0 && hoursDiff < 48;
    })
    .sort((a, b) => a.dt - b.dt)
    .slice(0, 16); // Максимум 16 прогнозов (48 часов / 3 часа)

  // Определяем, какой элемент является "сейчас" или ближайший
  const currentTimestamp = Math.floor(now.getTime() / 1000);

  if (threeHourlyForecasts.length === 0) {
    return (
      <div className="hourly-forecast">
        <h3 className="hourly-forecast__title">Прогноз на 48 часов</h3>
        <p className="hourly-forecast__no-data">Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <div className="hourly-forecast">
      <h3 className="hourly-forecast__title">
        Прогноз на 48 часов (каждые 3 часа)
      </h3>
      <div className="hourly-forecast__container">
        {threeHourlyForecasts.map((forecast, index) => {
          const date = new Date(forecast.dt * 1000);
          const temp = convertTemperature(forecast.main.temp, unit);
          const hour = date.getHours();
          const minutes = date.getMinutes();

          // Определяем "сейчас" - ближайший прогноз к текущему времени (в пределах 2 часов)
          const forecastTimestamp = forecast.dt;
          const timeDiff = Math.abs(forecastTimestamp - currentTimestamp);
          const isNow = timeDiff < 7200 && index === 0; // В пределах 2 часов и первый элемент

          return (
            <div
              key={`${forecast.dt}-${index}`}
              className={`hourly-forecast__item ${
                isNow ? "hourly-forecast__item--now" : ""
              }`}
            >
              <div className="hourly-forecast__time">
                {isNow ? (
                  <span className="hourly-forecast__now">Сейчас</span>
                ) : (
                  <span>
                    {hour.toString().padStart(2, "0")}:
                    {minutes.toString().padStart(2, "0")}
                  </span>
                )}
              </div>
              <img
                src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                alt={forecast.weather[0].description}
                className="hourly-forecast__icon"
              />
              <div className="hourly-forecast__temp">
                {Math.round(temp)}°{unit === "celsius" ? "C" : "F"}
              </div>
              {forecast.wind && (
                <div className="hourly-forecast__wind" title="Скорость ветра">
                  💨 {forecast.wind.speed.toFixed(1)} м/с
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
