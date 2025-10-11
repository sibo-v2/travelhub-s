import { useState } from 'react';
import { GripVertical, Edit2, Trash2, Clock, DollarSign, MapPin, Plane, Hotel, Utensils, MapPinned } from 'lucide-react';
import { Activity } from '../../services/aiTripPlannerService';

interface ActivityCardProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
  isDragging?: boolean;
}

export function ActivityCard({ activity, onEdit, onDelete, isDragging }: ActivityCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedActivity, setEditedActivity] = useState(activity);

  const handleSave = () => {
    onEdit(editedActivity);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedActivity(activity);
    setIsEditing(false);
  };

  const getCategoryIcon = () => {
    switch (activity.category) {
      case 'flight':
        return <Plane className="w-5 h-5" />;
      case 'hotel':
        return <Hotel className="w-5 h-5" />;
      case 'restaurant':
        return <Utensils className="w-5 h-5" />;
      case 'transport':
        return <MapPinned className="w-5 h-5" />;
      case 'activity':
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getCategoryColor = () => {
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

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-sky-500 dark:border-sky-400 p-4 shadow-lg">
        <div className="space-y-3">
          <input
            type="text"
            value={editedActivity.title}
            onChange={(e) =>
              setEditedActivity({ ...editedActivity, title: e.target.value })
            }
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 dark:text-white"
            placeholder="Activity title"
          />

          <textarea
            value={editedActivity.description}
            onChange={(e) =>
              setEditedActivity({ ...editedActivity, description: e.target.value })
            }
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 dark:text-white resize-none"
            placeholder="Description"
            rows={2}
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              value={editedActivity.time}
              onChange={(e) =>
                setEditedActivity({ ...editedActivity, time: e.target.value })
              }
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 dark:text-white"
            />

            <input
              type="text"
              value={editedActivity.duration}
              onChange={(e) =>
                setEditedActivity({ ...editedActivity, duration: e.target.value })
              }
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 dark:text-white"
              placeholder="Duration"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={editedActivity.location || ''}
              onChange={(e) =>
                setEditedActivity({ ...editedActivity, location: e.target.value })
              }
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 dark:text-white"
              placeholder="Location"
            />

            <input
              type="number"
              value={editedActivity.cost || 0}
              onChange={(e) =>
                setEditedActivity({
                  ...editedActivity,
                  cost: parseFloat(e.target.value) || 0,
                })
              }
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 dark:text-white"
              placeholder="Cost"
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-gradient-to-r from-sky-600 to-emerald-600 rounded-lg hover:from-sky-700 hover:to-emerald-700 transition-all"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <button className="cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mt-1">
          <GripVertical className="w-5 h-5" />
        </button>

        <div
          className={`flex items-center justify-center w-10 h-10 bg-gradient-to-br ${getCategoryColor()} rounded-lg flex-shrink-0 text-white`}
        >
          {getCategoryIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                {activity.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {activity.description}
              </p>
            </div>

            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                title="Edit activity"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(activity.id)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete activity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{activity.time}</span>
              <span className="text-gray-400 dark:text-gray-500">•</span>
              <span>{activity.duration}</span>
            </div>

            {activity.location && (
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{activity.location}</span>
              </div>
            )}

            {activity.cost !== undefined && activity.cost > 0 && (
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <DollarSign className="w-4 h-4" />
                <span>${activity.cost.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
