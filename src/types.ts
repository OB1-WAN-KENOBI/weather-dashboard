export interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastData;
}

export interface CurrentWeather {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    icon: string;
    description: string;
  }>;
  wind: {
    speed: number;
  };
}

export interface ForecastData {
  list: ForecastItem[];
}

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  weather: Array<{
    icon: string;
    description: string;
  }>;
  wind?: {
    speed: number;
  };
  dt_txt?: string;
}

export type TemperatureUnit = "celsius" | "fahrenheit";

export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

export interface GeolocationError {
  code: number;
  message: string;
  name: string;
}
