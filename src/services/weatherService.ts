export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
    current: number;
  };
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'partly-cloudy' | 'thunderstorm';
  humidity: number;
  windSpeed: number;
  precipitation: number;
  icon: string;
}

class WeatherService {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_WEATHER_API_KEY || '';
  }

  async getForecast(
    location: string,
    startDate: string,
    days: number = 7
  ): Promise<WeatherForecast[]> {
    try {
      if (!this.apiKey || this.apiKey === 'your_weather_api_key_here') {
        return this.getMockForecast(startDate, days);
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast/daily?q=${encodeURIComponent(
          location
        )}&cnt=${days}&units=imperial&appid=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      return this.transformWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      return this.getMockForecast(startDate, days);
    }
  }

  private transformWeatherData(data: any): WeatherForecast[] {
    return data.list.map((day: any) => ({
      date: new Date(day.dt * 1000).toISOString(),
      temperature: {
        min: Math.round(day.temp.min),
        max: Math.round(day.temp.max),
        current: Math.round(day.temp.day),
      },
      condition: this.mapWeatherCondition(day.weather[0].main),
      humidity: day.humidity,
      windSpeed: Math.round(day.speed),
      precipitation: day.rain || 0,
      icon: day.weather[0].icon,
    }));
  }

  private mapWeatherCondition(condition: string): WeatherForecast['condition'] {
    const conditionMap: Record<string, WeatherForecast['condition']> = {
      Clear: 'sunny',
      Clouds: 'cloudy',
      Rain: 'rainy',
      Snow: 'snowy',
      Drizzle: 'rainy',
      Thunderstorm: 'thunderstorm',
      Mist: 'cloudy',
      Fog: 'cloudy',
    };
    return conditionMap[condition] || 'partly-cloudy';
  }

  private getMockForecast(startDate: string, days: number): WeatherForecast[] {
    const forecasts: WeatherForecast[] = [];
    const start = new Date(startDate);

    const conditions: WeatherForecast['condition'][] = [
      'sunny',
      'partly-cloudy',
      'cloudy',
      'rainy',
    ];

    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);

      const baseTemp = 70 + Math.random() * 20;
      const condition = conditions[Math.floor(Math.random() * conditions.length)];

      forecasts.push({
        date: date.toISOString(),
        temperature: {
          min: Math.round(baseTemp - 5),
          max: Math.round(baseTemp + 10),
          current: Math.round(baseTemp + 5),
        },
        condition,
        humidity: Math.round(40 + Math.random() * 40),
        windSpeed: Math.round(5 + Math.random() * 15),
        precipitation: condition === 'rainy' ? Math.round(Math.random() * 50) : 0,
        icon: this.getWeatherIcon(condition),
      });
    }

    return forecasts;
  }

  getWeatherIcon(condition: WeatherForecast['condition']): string {
    const icons: Record<WeatherForecast['condition'], string> = {
      sunny: '☀️',
      'partly-cloudy': '⛅',
      cloudy: '☁️',
      rainy: '🌧️',
      snowy: '❄️',
      thunderstorm: '⛈️',
    };
    return icons[condition];
  }

  getWeatherEmoji(condition: WeatherForecast['condition']): string {
    return this.getWeatherIcon(condition);
  }
}

export const weatherService = new WeatherService();
