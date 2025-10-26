export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  snowfall: number;
  windSpeed: number;
  forecast?: DailyForecast[];
}

export interface DailyForecast {
  date: string;
  tempHigh: number;
  tempLow: number;
  snowfall: number;
  condition: string;
}

export interface CurrencyData {
  from: string;
  to: string;
  rate: number;
  amount?: number;
  converted?: number;
}

export interface HallucinationDetectionResult {
  isLikelyHallucination: boolean;
  confidence: number;
  reasons: string[];
  suggestedAction?: 'warn' | 'block' | 'verify';
}
