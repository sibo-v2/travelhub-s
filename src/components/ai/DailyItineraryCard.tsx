import { useState } from 'react';
import { Calendar, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { DailyItinerary, Activity } from '../../services/aiTripPlannerService';
import { ActivityCard } from './ActivityCard';

interface DailyItineraryCardProps {
  itinerary: DailyItinerary;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activityId: string) => void;
  onReorderActivities: (activities: Activity[]) => void;
}

export function DailyItineraryCard({
  itinerary,
  onEditActivity,
  onDeleteActivity,
  onReorderActivities,
}: DailyItineraryCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newActivities = [...itinerary.activities];
      const [draggedActivity] = newActivities.splice(draggedIndex, 1);
      newActivities.splice(dragOverIndex, 0, draggedActivity);
      onReorderActivities(newActivities);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-lg text-white font-bold text-lg">
            {itinerary.day}
          </div>

          <div className="text-left">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              Day {itinerary.day}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(itinerary.date)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">Daily Cost</div>
            <div className="flex items-center gap-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
              <span>{itinerary.totalCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-gray-500 dark:text-gray-400">
            {isExpanded ? (
              <ChevronUp className="w-6 h-6" />
            ) : (
              <ChevronDown className="w-6 h-6" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-3">
          {itinerary.activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No activities planned for this day
            </div>
          ) : (
            itinerary.activities.map((activity, index) => (
              <div
                key={activity.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDragLeave={handleDragLeave}
                className={`transition-all ${
                  dragOverIndex === index && draggedIndex !== index
                    ? 'transform scale-105 border-2 border-dashed border-sky-500 dark:border-sky-400 rounded-lg'
                    : ''
                }`}
              >
                <ActivityCard
                  activity={activity}
                  onEdit={onEditActivity}
                  onDelete={onDeleteActivity}
                  isDragging={draggedIndex === index}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
