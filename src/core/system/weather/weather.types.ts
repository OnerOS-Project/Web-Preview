export interface WeatherData {
  temperature: number;
  condition: string;
  icon?: string;
  location?: string;
  humidity?: number;
  wind?: number;
  feelsLike?: number;
}

export type WeatherStatus = 'loading' | 'success' | 'unavailable';

export interface WeatherState {
  status: WeatherStatus;
  data?: WeatherData;
}

export interface WeatherProvider {
  fetch(): Promise<WeatherData | null>;
}
