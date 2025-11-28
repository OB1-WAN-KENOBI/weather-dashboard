import type { ForecastItem } from "../types";

/**
 * Интерполирует 3-часовые данные API в почасовой прогноз
 * с учетом суточного цикла температуры
 */
export const interpolateHourlyForecast = (
  forecasts: ForecastItem[],
  currentTime: Date = new Date()
): ForecastItem[] => {
  if (forecasts.length === 0) {
    return [];
  }

  const now = new Date(currentTime);
  now.setMinutes(0, 0, 0);

  // Фильтруем прогнозы на следующие 24 часа
  const relevantForecasts = forecasts
    .filter((forecast) => {
      const forecastDate = new Date(forecast.dt * 1000);
      const hoursDiff =
        (forecastDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursDiff >= 0 && hoursDiff < 24;
    })
    .sort((a, b) => a.dt - b.dt);

  if (relevantForecasts.length === 0) {
    return [];
  }

  const hourlyForecasts: ForecastItem[] = [];

  // Если у нас уже есть почасовые данные (24+ элемента), просто возвращаем их
  if (relevantForecasts.length >= 24) {
    return relevantForecasts.slice(0, 24);
  }

  // Интерполируем для каждого часа
  for (let i = 0; i < 24; i++) {
    const targetTime = new Date(now);
    targetTime.setHours(now.getHours() + i, 0, 0, 0);
    const targetTimestamp = Math.floor(targetTime.getTime() / 1000);
    const targetHour = targetTime.getHours();

    // Находим ближайшие прогнозы до и после целевого времени
    let before: ForecastItem | null = null;
    let after: ForecastItem | null = null;

    for (let j = 0; j < relevantForecasts.length; j++) {
      if (relevantForecasts[j].dt <= targetTimestamp) {
        before = relevantForecasts[j];
      }
      if (relevantForecasts[j].dt >= targetTimestamp && !after) {
        after = relevantForecasts[j];
        break;
      }
    }

    // Если нет данных до или после, используем ближайший
    if (!before && after) before = after;
    if (!after && before) after = before;
    if (!before && !after) continue;

    const beforeItem = before!;
    const afterItem = after!;

    // Вычисляем коэффициент интерполяции
    const timeDiff = afterItem.dt - beforeItem.dt;
    const targetDiff = targetTimestamp - beforeItem.dt;
    const ratio =
      timeDiff > 0 ? Math.max(0, Math.min(1, targetDiff / timeDiff)) : 0;

    // Интерполируем температуру с учетом суточного цикла
    let interpolatedTemp = beforeItem.main.temp;

    if (timeDiff > 0 && beforeItem.dt !== afterItem.dt) {
      // Линейная интерполяция между точками
      const linearTemp =
        beforeItem.main.temp +
        (afterItem.main.temp - beforeItem.main.temp) * ratio;

      // Корректировка с учетом времени суток (более мягкая)
      // Ночью (0-6, 20-23) температура обычно ниже на 2-5°C
      // Днем (10-16) температура выше на 2-5°C
      let dayCycleAdjustment = 0;
      const tempRange = Math.abs(afterItem.main.temp - beforeItem.main.temp);
      const adjustmentFactor = Math.min(tempRange * 0.3, 3); // Максимум 3°C корректировки

      if (targetHour >= 0 && targetHour < 6) {
        // Ночь: снижаем температуру (самая холодная часть ночи)
        dayCycleAdjustment = -adjustmentFactor * (1 - targetHour / 6);
      } else if (targetHour >= 6 && targetHour < 10) {
        // Утро: постепенный рост
        dayCycleAdjustment = -adjustmentFactor * (1 - (targetHour - 6) / 4);
      } else if (targetHour >= 10 && targetHour < 16) {
        // День: пик температуры (самый теплый период)
        dayCycleAdjustment =
          adjustmentFactor * (1 - Math.abs(targetHour - 13) / 3);
      } else if (targetHour >= 16 && targetHour < 20) {
        // Вечер: постепенное снижение
        dayCycleAdjustment = adjustmentFactor * (1 - (targetHour - 16) / 4);
      } else {
        // Ночь: низкая температура
        dayCycleAdjustment = -adjustmentFactor * ((targetHour - 20) / 4);
      }

      interpolatedTemp = linearTemp + dayCycleAdjustment;
    }

    // Выбираем ближайший прогноз для погодных условий
    const closest = targetDiff < timeDiff / 2 ? beforeItem : afterItem;

    hourlyForecasts.push({
      dt: targetTimestamp,
      main: {
        temp: Math.round(interpolatedTemp * 10) / 10,
        feels_like:
          closest.main.feels_like ||
          Math.round((interpolatedTemp - 2) * 10) / 10,
        humidity: closest.main.humidity || 60,
        pressure: closest.main.pressure || 1000,
      },
      weather: closest.weather,
      wind: closest.wind || { speed: 2 },
      dt_txt: targetTime.toISOString(),
    });
  }

  return hourlyForecasts;
};
