export interface WeatherData {
  temperature: number;
  condition: string;
  icon?: string;
  location?: string;
}

export type WeatherStatus = 'loading' | 'success' | 'unavailable';

export interface WeatherState {
  status: WeatherStatus;
  data?: WeatherData;
}

export interface WeatherProvider {
  fetch(): Promise<WeatherData | null>;
}
