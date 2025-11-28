import React from "react";
import type { ForecastItem, TemperatureUnit } from "../../types";
import { convertTemperature } from "../../utils/temperature";
import { formatDate } from "../../utils/date";
import "./Forecast.css";

interface ForecastProps {
  forecasts: ForecastItem[];
  unit: TemperatureUnit;
}

export const Forecast: React.FC<ForecastProps> = ({ forecasts, unit }) => {
  return (
    <div className="forecast">
      <h3 className="forecast__title">Прогноз на 3 дня</h3>
      <div className="forecast__container">
        {forecasts.map((forecast, index) => {
          const date = new Date(forecast.dt * 1000);
          const temp = convertTemperature(forecast.main.temp, unit);

          return (
            <div key={`${forecast.dt}-${index}`} className="forecast__item">
              <div className="forecast__date">{formatDate(date, true)}</div>
              <img
                src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                alt={forecast.weather[0].description}
                className="forecast__icon"
              />
              <div className="forecast__temp">
                {Math.round(temp)}°{unit === "celsius" ? "C" : "F"}
              </div>
              <div className="forecast__desc">
                {forecast.weather[0].description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
