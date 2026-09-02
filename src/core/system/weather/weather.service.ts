import type { WeatherProvider, WeatherData } from './weather.types';

const CACHE_KEY = 'os_weather_cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface CachedWeather {
  data: WeatherData;
  timestamp: number;
}

function getCached(): WeatherData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedWeather = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL) return null;
    return cached.data;
  } catch {
    return null;
  }
}

function setCached(data: WeatherData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { /* noop */ }
}

/**
 * WeatherService — manages weather data with caching and provider abstraction.
 *
 * Usage:
 *   const service = new WeatherService(provider);
 *   const data = await service.getWeather();
 */
export class WeatherService {
  private provider: WeatherProvider | null;

  constructor(provider: WeatherProvider | null) {
    this.provider = provider;
  }

  async getWeather(): Promise<WeatherData | null> {
    // Check cache first
    const cached = getCached();
    if (cached) return cached;

    // Fetch from provider
    if (!this.provider) return null;

    try {
      const data = await this.provider.fetch();
      if (data) setCached(data);
      return data;
    } catch {
      return null;
    }
  }

  setProvider(provider: WeatherProvider | null): void {
    this.provider = provider;
  }

  clearCache(): void {
    localStorage.removeItem(CACHE_KEY);
  }
}
