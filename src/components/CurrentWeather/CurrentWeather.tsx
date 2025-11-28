import React from "react";
import type {
  CurrentWeather as CurrentWeatherType,
  TemperatureUnit,
} from "../../types";
import { formatTemperature, convertTemperature } from "../../utils/temperature";
import { formatDate } from "../../utils/date";
import "./CurrentWeather.css";

interface CurrentWeatherProps {
  weather: CurrentWeatherType;
  unit: TemperatureUnit;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  lastUpdated?: Date;
  onRefresh?: () => void;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  weather,
  unit,
  isFavorite,
  onToggleFavorite,
  lastUpdated,
  onRefresh,
}) => {
  const feelsLike = formatTemperature(weather.main.feels_like, unit);
  const pressure = Math.round(weather.main.pressure * 0.750062);

  return (
    <div className="current-weather">
      <div className="current-weather__location">
        <div className="current-weather__header">
          <div>
            <h2 className="current-weather__city">{weather.name}</h2>
            <p className="current-weather__date">{formatDate(new Date())}</p>
            {lastUpdated && (
              <p className="current-weather__updated">
                Обновлено:{" "}
                {lastUpdated.toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
          <div className="current-weather__actions">
            <button
              onClick={onToggleFavorite}
              className={`current-weather__favorite ${
                isFavorite ? "current-weather__favorite--active" : ""
              }`}
              title={
                isFavorite ? "Удалить из избранного" : "Добавить в избранное"
              }
              aria-label={
                isFavorite ? "Удалить из избранного" : "Добавить в избранное"
              }
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="current-weather__refresh"
                title="Обновить данные"
                aria-label="Обновить данные"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="current-weather__main">
        <div className="current-weather__icon">
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
            className="current-weather__img"
          />
        </div>
        <div className="current-weather__temp-info">
          <div className="current-weather__temp">
            <span className="current-weather__temp-value">
              {Math.round(convertTemperature(weather.main.temp, unit))}
            </span>
            <span className="current-weather__temp-unit">
              °{unit === "celsius" ? "C" : "F"}
            </span>
          </div>
          <p className="current-weather__desc">
            {weather.weather[0].description}
          </p>
        </div>
      </div>
      <div className="current-weather__details">
        <div className="current-weather__detail">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2v20M2 12h20"></path>
          </svg>
          <span>Ощущается как</span>
          <span className="current-weather__detail-value">{feelsLike}</span>
        </div>
        <div className="current-weather__detail">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2v20M2 12h20"></path>
          </svg>
          <span>Влажность</span>
          <span className="current-weather__detail-value">
            {Math.round(weather.main.humidity)}%
          </span>
        </div>
        <div className="current-weather__detail">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2v20M2 12h20"></path>
          </svg>
          <span>Ветер</span>
          <span className="current-weather__detail-value">
            {weather.wind.speed.toFixed(1)} м/с
          </span>
        </div>
        <div className="current-weather__detail">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2v20M2 12h20"></path>
          </svg>
          <span>Давление</span>
          <span className="current-weather__detail-value">
            {pressure} мм рт.ст.
          </span>
        </div>
      </div>
    </div>
  );
};
