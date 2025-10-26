import axios from "axios";
import { WeatherData, DailyForecast } from "../types";

/**
 * Weather Service using Open-Meteo API
 * Open-Meteo is a free, open-source weather API that requires NO API key
 * Perfect for development and academic projects
 *
 * API Documentation: https://open-meteo.com/
 */
export class WeatherService {
  private geocodingUrl = "https://geocoding-api.open-meteo.com/v1/search";
  private weatherUrl = "https://api.open-meteo.com/v1/forecast";

  constructor() {
    console.log("✅ Using Open-Meteo API");
  }

  /**
   * Get coordinates for a location using Open-Meteo Geocoding API
   * Tries multiple location name variations if first attempt fails
   */
  private async getCoordinates(
    location: string
  ): Promise<{ lat: number; lon: number; name: string }> {
    // Generate location variations to try
    const locationVariations = [
      location, // Original
      location.replace(/'/g, "'"), // Straight apostrophe to curly
      location.replace(/'/g, "'"), // Curly to straight
      location.replace(/['']/g, ""), // Remove apostrophes
      location.replace(/['']/g, "-"), // Replace with hyphen
      location + ", France", // Add country for ski resorts
    ];

    // Remove duplicates
    const uniqueLocations = [...new Set(locationVariations)];

    // Try each variation
    for (const loc of uniqueLocations) {
      try {
        const response = await axios.get(this.geocodingUrl, {
          params: {
            name: loc,
            count: 1,
            language: "en",
            format: "json",
          },
        });

        if (response.data.results && response.data.results.length > 0) {
          const result = response.data.results[0];
          console.log(`✅ Found location: "${loc}" → ${result.name}`);
          return {
            lat: result.latitude,
            lon: result.longitude,
            name: result.name,
          };
        }
      } catch (error) {
        // Continue to next variation
        continue;
      }
    }

    // If all variations failed
    throw new Error(
      `Location "${location}" not found. Tried variations: ${uniqueLocations.join(", ")}`
    );
  }

  /**
   * Get weather data using Open-Meteo API
   */
  async getWeather(
    location: string,
    units: "celsius" | "fahrenheit" = "celsius"
  ): Promise<WeatherData> {
    try {
      // Step 1: Get coordinates for the location
      const { lat, lon, name } = await this.getCoordinates(location);

      // Step 2: Get weather data
      const tempUnit = units === "celsius" ? "celsius" : "fahrenheit";
      const windUnit = units === "celsius" ? "kmh" : "mph";

      const response = await axios.get(this.weatherUrl, {
        params: {
          latitude: lat,
          longitude: lon,
          current: [
            "temperature_2m",
            "weather_code",
            "wind_speed_10m",
            "snowfall",
          ].join(","),
          daily: [
            "temperature_2m_max",
            "temperature_2m_min",
            "weather_code",
            "snowfall_sum",
          ].join(","),
          temperature_unit: tempUnit,
          wind_speed_unit: windUnit,
          forecast_days: 7,
          timezone: "auto",
        },
      });

      const current = response.data.current;
      const daily = response.data.daily;

      // Map weather codes to conditions
      const condition = this.mapWeatherCode(current.weather_code);

      // Process forecast data
      const dailyForecasts: DailyForecast[] = [];
      for (let i = 0; i < Math.min(5, daily.time.length); i++) {
        dailyForecasts.push({
          date: daily.time[i],
          tempHigh: Math.round(daily.temperature_2m_max[i]),
          tempLow: Math.round(daily.temperature_2m_min[i]),
          snowfall: Math.round(daily.snowfall_sum[i] || 0),
          condition: this.mapWeatherCode(daily.weather_code[i]),
        });
      }

      const weatherData: WeatherData = {
        location: name,
        temperature: Math.round(current.temperature_2m),
        condition: condition,
        snowfall: Math.round(current.snowfall || 0),
        windSpeed: Math.round(current.wind_speed_10m),
        forecast: dailyForecasts,
      };

      return weatherData;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Weather API error: ${error.response?.data?.reason || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Map WMO Weather codes to readable conditions
   * Reference: https://open-meteo.com/en/docs
   */
  private mapWeatherCode(code: number): string {
    const weatherCodes: { [key: number]: string } = {
      0: "Clear",
      1: "Mainly Clear",
      2: "Partly Cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Foggy",
      51: "Light Drizzle",
      53: "Drizzle",
      55: "Heavy Drizzle",
      61: "Light Rain",
      63: "Rain",
      65: "Heavy Rain",
      66: "Freezing Rain",
      67: "Heavy Freezing Rain",
      71: "Light Snow",
      73: "Snow",
      75: "Heavy Snow",
      77: "Snow Grains",
      80: "Light Showers",
      81: "Showers",
      82: "Heavy Showers",
      85: "Light Snow Showers",
      86: "Snow Showers",
      95: "Thunderstorm",
      96: "Thunderstorm with Hail",
      99: "Heavy Thunderstorm with Hail",
    };

    return weatherCodes[code] || "Unknown";
  }

  async getSkiConditions(
    resortLocation: string
  ): Promise<WeatherData & { skiConditions: string }> {
    const weather = await this.getWeather(resortLocation);

    // Analyze conditions for skiing
    let skiConditions = "Unknown";

    if (weather.temperature < -10) {
      skiConditions = "Very cold - dress warmly. Good snow conditions.";
    } else if (weather.temperature < 0) {
      skiConditions = "Excellent skiing conditions with good snow quality.";
    } else if (weather.temperature < 5) {
      skiConditions =
        "Good conditions, though snow may be softer in afternoon.";
    } else {
      skiConditions =
        "Warm conditions - snow may be slushy. Best skiing in morning.";
    }

    if (weather.snowfall > 10) {
      skiConditions += " Heavy fresh snowfall - powder conditions!";
    } else if (weather.snowfall > 0) {
      skiConditions += " Fresh snow expected.";
    }

    if (weather.windSpeed > 30) {
      skiConditions += " WARNING: High winds - some lifts may be closed.";
    }

    return {
      ...weather,
      skiConditions,
    };
  }
}
