import { Clock, MapPin, DollarSign, Navigation } from 'lucide-react';
import { Activity } from '../../services/aiTripPlannerService';

interface TimelineActivityProps {
  activity: Activity;
  isLast?: boolean;
  travelTime?: string;
}

export function TimelineActivity({ activity, isLast, travelTime }: TimelineActivityProps) {
  const getCategoryColor = () => {
    switch (activity.category) {
      case 'flight':
        return 'bg-sky-500';
      case 'hotel':
        return 'bg-emerald-500';
      case 'restaurant':
        return 'bg-orange-500';
      case 'transport':
        return 'bg-purple-500';
      case 'activity':
      default:
        return 'bg-amber-500';
    }
  };

  const getCategoryGradient = () => {
    switch (activity.category) {
      case 'flight':
        return 'from-sky-500 to-sky-600';
      case 'hotel':
        return 'from-emerald-500 to-emerald-600';
      case 'restaurant':
        return 'from-orange-500 to-orange-600';
      case 'transport':
        return 'from-purple-500 to-purple-600';
      case 'activity':
      default:
        return 'from-amber-500 to-amber-600';
    }
  };

  const getActivityImage = () => {
    const categoryImages: Record<string, string> = {
      flight: 'https://images.pexels.com/photos/46148/aircraft-jet-landing-cloud-46148.jpeg?auto=compress&cs=tinysrgb&w=800',
      hotel: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800',
      restaurant: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800',
      transport: 'https://images.pexels.com/photos/358220/pexels-photo-358220.jpeg?auto=compress&cs=tinysrgb&w=800',
      activity: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=800',
    };
    return categoryImages[activity.category] || categoryImages.activity;
  };

  return (
    <div className="relative">
      <div className="flex gap-6">
        <div className="relative flex flex-col items-center">
          <div className="flex items-center justify-center w-4 h-4 bg-white dark:bg-gray-900 border-4 border-gray-300 dark:border-gray-600 rounded-full z-10" />

          {!isLast && (
            <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 absolute top-4" />
          )}
        </div>

        <div className="flex-1 pb-8">
          <div className="mb-2">
            <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold">
              {activity.time}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative h-48 overflow-hidden">
              <img
                src={getActivityImage()}
                alt={activity.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute top-3 right-3 px-3 py-1 bg-gradient-to-r ${getCategoryGradient()} text-white text-xs font-semibold rounded-full capitalize`}>
                {activity.category}
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {activity.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {activity.description}
              </p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>{activity.duration}</span>
                </div>

                {activity.location && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="truncate max-w-xs">{activity.location}</span>
                  </div>
                )}

                {activity.cost !== undefined && activity.cost > 0 && (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <DollarSign className="w-4 h-4" />
                    <span>${activity.cost.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {travelTime && !isLast && (
        <div className="flex gap-6 mb-4">
          <div className="w-4" />
          <div className="flex-1">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <Navigation className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Travel time: <span className="font-semibold text-gray-900 dark:text-white">{travelTime}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
