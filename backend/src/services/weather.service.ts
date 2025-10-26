import axios from 'axios';
import { WeatherData, DailyForecast } from '../types';

export class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OPENWEATHER_API_KEY not set. Weather functionality will be limited.');
    }
  }

  async getWeather(location: string, units: 'celsius' | 'fahrenheit' = 'celsius'): Promise<WeatherData> {
    try {
      const unitParam = units === 'celsius' ? 'metric' : 'imperial';

      // Get current weather
      const currentResponse = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: location,
          appid: this.apiKey,
          units: unitParam
        }
      });

      // Get coordinates for forecast
      const { coord } = currentResponse.data;

      // Get 5-day forecast
      const forecastResponse = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat: coord.lat,
          lon: coord.lon,
          appid: this.apiKey,
          units: unitParam
        }
      });

      // Process forecast data (get one per day)
      const dailyForecasts: DailyForecast[] = [];
      const forecastByDay = new Map<string, any>();

      forecastResponse.data.list.forEach((item: any) => {
        const date = item.dt_txt.split(' ')[0];
        if (!forecastByDay.has(date)) {
          forecastByDay.set(date, item);
        }
      });

      forecastByDay.forEach((item, date) => {
        dailyForecasts.push({
          date,
          tempHigh: Math.round(item.main.temp_max),
          tempLow: Math.round(item.main.temp_min),
          snowfall: item.snow ? Math.round(item.snow['3h'] || 0) : 0,
          condition: item.weather[0].main
        });
      });

      const weatherData: WeatherData = {
        location: currentResponse.data.name,
        temperature: Math.round(currentResponse.data.main.temp),
        condition: currentResponse.data.weather[0].main,
        snowfall: currentResponse.data.snow ? Math.round(currentResponse.data.snow['1h'] || 0) : 0,
        windSpeed: Math.round(currentResponse.data.wind.speed),
        forecast: dailyForecasts.slice(0, 5)
      };

      return weatherData;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Weather API error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async getSkiConditions(resortLocation: string): Promise<WeatherData & { skiConditions: string }> {
    const weather = await this.getWeather(resortLocation);

    // Analyze conditions for skiing
    let skiConditions = 'Unknown';

    if (weather.temperature < -10) {
      skiConditions = 'Very cold - dress warmly. Good snow conditions.';
    } else if (weather.temperature < 0) {
      skiConditions = 'Excellent skiing conditions with good snow quality.';
    } else if (weather.temperature < 5) {
      skiConditions = 'Good conditions, though snow may be softer in afternoon.';
    } else {
      skiConditions = 'Warm conditions - snow may be slushy. Best skiing in morning.';
    }

    if (weather.snowfall > 10) {
      skiConditions += ' Heavy fresh snowfall - powder conditions!';
    } else if (weather.snowfall > 0) {
      skiConditions += ' Fresh snow expected.';
    }

    if (weather.windSpeed > 30) {
      skiConditions += ' WARNING: High winds - some lifts may be closed.';
    }

    return {
      ...weather,
      skiConditions
    };
  }
}
