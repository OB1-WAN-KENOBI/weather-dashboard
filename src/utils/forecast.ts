import type { ForecastItem } from "../types";

export const getDailyForecasts = (
  forecastList: ForecastItem[]
): ForecastItem[] => {
  const dailyForecasts: ForecastItem[] = [];
  const seenDates = new Set<string>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedForecasts = [...forecastList].sort((a, b) => a.dt - b.dt);

  sortedForecasts.forEach((forecast) => {
    const date = new Date(forecast.dt * 1000);
    const dateString = date.toDateString();

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

  if (dailyForecasts.length < 3 && sortedForecasts.length > 0) {
    const remainingForecasts = sortedForecasts.filter((forecast) => {
      const date = new Date(forecast.dt * 1000);
      const dateString = date.toDateString();
      return !seenDates.has(dateString);
    });

    while (dailyForecasts.length < 3 && remainingForecasts.length > 0) {
      const forecast = remainingForecasts.shift();
      if (!forecast) break;

      const date = new Date(forecast.dt * 1000);
      const dateString = date.toDateString();

      if (!seenDates.has(dateString)) {
        seenDates.add(dateString);
        dailyForecasts.push(forecast);
      }
    }
  }

  return dailyForecasts.slice(0, 3);
};
