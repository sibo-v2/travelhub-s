import { useState, useEffect } from 'react';
import {
  Calendar,
  Download,
  FileText,
  Smartphone,
  Cloud,
  Wind,
  Droplets,
  DollarSign,
  MapPin,
  Clock,
} from 'lucide-react';
import { DailyItinerary } from '../../services/aiTripPlannerService';
import { TimelineActivity } from './TimelineActivity';
import { weatherService, WeatherForecast } from '../../services/weatherService';
import { itineraryExportService } from '../../services/itineraryExportService';

interface DayItineraryViewProps {
  itinerary: DailyItinerary;
  destination: string;
  onExport?: (format: 'pdf' | 'google' | 'ics' | 'wallet') => void;
}

export function DayItineraryView({ itinerary, destination }: DayItineraryViewProps) {
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);

  useEffect(() => {
    loadWeather();
  }, [destination, itinerary.date]);

  const loadWeather = async () => {
    setIsLoadingWeather(true);
    try {
      const forecasts = await weatherService.getForecast(destination, itinerary.date, 1);
      if (forecasts.length > 0) {
        setWeather(forecasts[0]);
      }
    } catch (error) {
      console.error('Error loading weather:', error);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const formatDate = () => {
    return new Date(itinerary.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateTravelTime = (currentIndex: number): string | undefined => {
    if (currentIndex >= itinerary.activities.length - 1) return undefined;

    const travelTimes = ['10 minutes', '15 minutes', '20 minutes', '5 minutes', '25 minutes'];
    return travelTimes[currentIndex % travelTimes.length];
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur rounded-lg font-bold text-2xl">
                {itinerary.day}
              </div>
              <div>
                <h2 className="text-2xl font-bold">Day {itinerary.day}</h2>
                <div className="flex items-center gap-2 text-white/90">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate()}</span>
                </div>
              </div>
            </div>
          </div>

          {weather && !isLoadingWeather && (
            <div className="bg-white/20 backdrop-blur rounded-lg p-4 min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl">{weather.icon}</span>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {weather.temperature.current}°F
                  </div>
                  <div className="text-sm text-white/80 capitalize">{weather.condition}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-white/80">
                <div className="flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  <span>{weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="w-3 h-3" />
                  <span>{weather.windSpeed}mph</span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  <span>{weather.precipitation}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <Clock className="w-5 h-5 mx-auto mb-1" />
            <div className="text-2xl font-bold">{itinerary.activities.length}</div>
            <div className="text-sm text-white/80">Activities</div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <MapPin className="w-5 h-5 mx-auto mb-1" />
            <div className="text-2xl font-bold">{destination}</div>
            <div className="text-sm text-white/80">Location</div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <DollarSign className="w-5 h-5 mx-auto mb-1" />
            <div className="text-2xl font-bold">${itinerary.totalCost.toFixed(0)}</div>
            <div className="text-sm text-white/80">Daily Cost</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Today's Schedule</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {itinerary.activities.length} activities planned
          </div>
        </div>

        <div className="space-y-1">
          {itinerary.activities.map((activity, index) => (
            <TimelineActivity
              key={activity.id}
              activity={activity}
              isLast={index === itinerary.activities.length - 1}
              travelTime={calculateTravelTime(index)}
            />
          ))}
        </div>
      </div>

      {weather && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Weather Advisory
          </h3>
          <div className="space-y-3">
            {weather.condition === 'rainy' && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                    Rain Expected
                  </div>
                  <div className="text-blue-700 dark:text-blue-300">
                    Don't forget your umbrella! {weather.precipitation}% chance of rain.
                  </div>
                </div>
              </div>
            )}

            {weather.temperature.max > 85 && (
              <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <Cloud className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-orange-900 dark:text-orange-200 mb-1">
                    Hot Day Ahead
                  </div>
                  <div className="text-orange-700 dark:text-orange-300">
                    Temperature reaching {weather.temperature.max}°F. Stay hydrated and wear
                    sunscreen!
                  </div>
                </div>
              </div>
            )}

            {weather.windSpeed > 15 && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                <Wind className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-gray-900 dark:text-gray-200 mb-1">
                    Windy Conditions
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    Winds up to {weather.windSpeed}mph. Consider indoor activities.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
