import { Heart, Trash2, Plus, MapPin } from 'lucide-react';
import { SavedItem, dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface SavedItemsProps {
  items: SavedItem[];
  onRefresh: () => void;
}

export function SavedItems({ items, onRefresh }: SavedItemsProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleRemoveItem = async (itemId: string) => {
    if (!user) return;

    const result = await dashboardService.removeSavedItem(user.id, itemId);

    if (result.success) {
      showToast('Item removed from wishlist', 'success');
      onRefresh();
    } else {
      showToast('Failed to remove item', 'error');
    }
  };

  const getItemIcon = (type: string) => {
    const icons: Record<string, string> = {
      place: '📍',
      activity: '🎯',
      hotel: '🏨',
      restaurant: '🍽️',
    };
    return icons[type] || '📌';
  };

  const getItemColor = (type: string) => {
    const colors: Record<string, string> = {
      place: 'bg-sky-100 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300',
      activity: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
      hotel: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
      restaurant: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
    };
    return colors[type] || 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300';
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
          <Heart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Your wishlist is empty
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Start saving places, activities, and hotels you'd like to visit
        </p>
        <button className="px-6 py-3 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all shadow-md">
          Explore Destinations
        </button>
      </div>
    );
  }

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.itemType]) {
      acc[item.itemType] = [];
    }
    acc[item.itemType].push(item);
    return acc;
  }, {} as Record<string, SavedItem[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedItems).map(([type, typeItems]) => (
        <div key={type}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 capitalize flex items-center gap-2">
            <span>{getItemIcon(type)}</span>
            {type}s ({typeItems.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {typeItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all"
              >
                {item.itemData?.images?.[0] && (
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={item.itemData.images[0].url || item.itemData.images[0]}
                      alt={item.itemName}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full transition-colors group"
                    >
                      <Heart className="w-5 h-5 fill-red-500 text-red-500 group-hover:fill-red-600 group-hover:text-red-600" />
                    </button>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">
                      {item.itemName}
                    </h4>
                    <span
                      className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-semibold capitalize ${getItemColor(
                        item.itemType
                      )}`}
                    >
                      {item.itemType}
                    </span>
                  </div>

                  {item.itemData?.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-amber-400">⭐</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {item.itemData.rating}
                      </span>
                      {item.itemData.reviewCount && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({item.itemData.reviewCount})
                        </span>
                      )}
                    </div>
                  )}

                  {item.itemData?.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{item.itemData.address}</span>
                    </div>
                  )}

                  {item.notes && (
                    <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-900 rounded text-sm text-gray-700 dark:text-gray-300">
                      {item.notes}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold transition-colors text-sm">
                      <Plus className="w-4 h-4" />
                      Add to Trip
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-red-500 dark:hover:border-red-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-xl p-6 text-center">
        <h4 className="font-bold text-sky-900 dark:text-sky-100 mb-2">
          Keep Exploring
        </h4>
        <p className="text-sm text-sky-700 dark:text-sky-300 mb-4">
          Discover more amazing places to add to your wishlist
        </p>
        <button className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold transition-colors">
          Browse Destinations
        </button>
      </div>
    </div>
  );
}
