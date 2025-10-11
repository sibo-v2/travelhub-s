import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { TripPlan } from '../../services/aiTripPlannerService';

interface BudgetTrackerProps {
  tripPlan: TripPlan | null;
}

export function BudgetTracker({ tripPlan }: BudgetTrackerProps) {
  if (!tripPlan) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Budget Tracker</h3>
        </div>

        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-sm">Create a trip plan to start tracking your budget</p>
        </div>
      </div>
    );
  }

  const budget = tripPlan.budget;
  const totalCost = tripPlan.totalCost;
  const remaining = budget - totalCost;
  const percentageUsed = (totalCost / budget) * 100;
  const isOverBudget = totalCost > budget;

  const getCategoryBreakdown = () => {
    const breakdown: Record<string, number> = {
      flight: 0,
      hotel: 0,
      restaurant: 0,
      activity: 0,
      transport: 0,
    };

    tripPlan.itinerary.forEach((day) => {
      day.activities.forEach((activity) => {
        if (activity.cost) {
          breakdown[activity.category] = (breakdown[activity.category] || 0) + activity.cost;
        }
      });
    });

    return breakdown;
  };

  const categoryBreakdown = getCategoryBreakdown();

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      flight: '✈️',
      hotel: '🏨',
      restaurant: '🍽️',
      activity: '🎯',
      transport: '🚗',
    };
    return icons[category] || '📍';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      flight: 'from-sky-500 to-sky-600',
      hotel: 'from-emerald-500 to-emerald-600',
      restaurant: 'from-orange-500 to-orange-600',
      activity: 'from-amber-500 to-amber-600',
      transport: 'from-purple-500 to-purple-600',
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6 sticky top-6">
      <div className="flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Budget Tracker</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-sky-900/20 dark:to-emerald-900/20 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Budget</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            ${budget.toFixed(2)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Budget Used</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {percentageUsed.toFixed(1)}%
            </span>
          </div>

          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : percentageUsed > 80
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
              }`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Spent</div>
            <div className="flex items-center gap-1 text-lg font-bold text-gray-900 dark:text-white">
              <DollarSign className="w-4 h-4" />
              {totalCost.toFixed(2)}
            </div>
          </div>

          <div
            className={`rounded-lg p-3 ${
              isOverBudget
                ? 'bg-red-50 dark:bg-red-900/20'
                : 'bg-emerald-50 dark:bg-emerald-900/20'
            }`}
          >
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Remaining</div>
            <div
              className={`flex items-center gap-1 text-lg font-bold ${
                isOverBudget
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              {Math.abs(remaining).toFixed(2)}
            </div>
          </div>
        </div>

        {isOverBudget ? (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-red-900 dark:text-red-200 mb-1">
                Over Budget
              </div>
              <div className="text-red-700 dark:text-red-300">
                You're ${Math.abs(remaining).toFixed(2)} over your budget. Consider adjusting
                your activities.
              </div>
            </div>
          </div>
        ) : percentageUsed > 80 ? (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                Nearly at Budget
              </div>
              <div className="text-amber-700 dark:text-amber-300">
                You've used {percentageUsed.toFixed(0)}% of your budget. Plan carefully!
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
                Within Budget
              </div>
              <div className="text-emerald-700 dark:text-emerald-300">
                You have ${remaining.toFixed(2)} left to spend!
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Spending Breakdown
        </h4>

        <div className="space-y-2">
          {Object.entries(categoryBreakdown)
            .filter(([_, amount]) => amount > 0)
            .sort(([_, a], [__, b]) => b - a)
            .map(([category, amount]) => {
              const percentage = (amount / totalCost) * 100;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span>{getCategoryIcon(category)}</span>
                      <span className="text-gray-700 dark:text-gray-300 capitalize">
                        {category}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getCategoryColor(category)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {tripPlan.suggestions && tripPlan.suggestions.length > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Money-Saving Tips
          </h4>
          <ul className="space-y-2">
            {tripPlan.suggestions.slice(0, 3).map((suggestion, index) => (
              <li
                key={index}
                className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
              >
                <span className="text-emerald-600 dark:text-emerald-400 flex-shrink-0">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
