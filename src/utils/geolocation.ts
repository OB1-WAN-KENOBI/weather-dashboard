import type { GeolocationPosition, GeolocationError } from "../types";

export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Геолокация не поддерживается"));
      return;
    }

    const tryGeolocation = (options: PositionOptions) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(position);
        },
        (error: GeolocationPositionError) => {
          if (error.code === 2 && options.enableHighAccuracy) {
            tryGeolocation({
              enableHighAccuracy: false,
              timeout: 15000,
              maximumAge: 300000,
            });
            return;
          }

          const geolocationError: GeolocationError = {
            code: error.code,
            message: error.message,
            name: error.constructor.name || "GeolocationPositionError",
          };

          reject(geolocationError);
        },
        options
      );
    };

    tryGeolocation({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });
};

export const getGeolocationErrorMessage = (error: GeolocationError): string => {
  if (error.code === 1) {
    return "Для автоматического определения местоположения разрешите доступ в настройках браузера";
  } else if (error.code === 2) {
    return "Не удалось определить местоположение. Введите город вручную или попробуйте позже";
  } else if (error.code === 3) {
    return "Превышено время ожидания. Попробуйте еще раз";
  } else {
    return "Ошибка геолокации. Введите город вручную";
  }
};
