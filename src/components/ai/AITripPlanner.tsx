import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  aiTripPlannerService,
  ChatMessage,
  TripPlan,
  Activity,
} from '../../services/aiTripPlannerService';
import { ChatInterface } from './ChatInterface';
import { DailyItineraryCard } from './DailyItineraryCard';
import { BudgetTracker } from './BudgetTracker';

export function AITripPlanner() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTripPlan, setCurrentTripPlan] = useState<TripPlan | null>(null);

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    if (!user) return;

    try {
      const history = await aiTripPlannerService.getChatHistory(user.id);
      setMessages(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!user) {
      showToast('Please sign in to use the AI trip planner', 'error');
      return;
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      await aiTripPlannerService.saveChatMessage(user.id, userMessage);

      const result = await aiTripPlannerService.generateTripPlan(user.id, content);

      if (result.success && result.tripPlan) {
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: generateResponseText(result.tripPlan),
          timestamp: new Date(),
          tripPlan: result.tripPlan,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setCurrentTripPlan(result.tripPlan);

        await aiTripPlannerService.saveChatMessage(user.id, assistantMessage);

        showToast('Trip plan generated successfully!', 'success');
      } else {
        throw new Error(result.error || 'Failed to generate trip plan');
      }
    } catch (error) {
      console.error('Error generating trip plan:', error);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content:
          "I apologize, but I'm having trouble generating your trip plan right now. Please try again or rephrase your request.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      showToast('Failed to generate trip plan', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateResponseText = (tripPlan: TripPlan): string => {
    const duration = tripPlan.itinerary.length;
    return `I've created a personalized ${duration}-day itinerary for your trip to ${tripPlan.destination}!

Your trip includes ${tripPlan.itinerary.reduce((sum, day) => sum + day.activities.length, 0)} carefully planned activities across ${duration} days.

Budget: $${tripPlan.budget.toFixed(2)}
Estimated Total Cost: $${tripPlan.totalCost.toFixed(2)}
${tripPlan.budget - tripPlan.totalCost >= 0 ? `Remaining: $${(tripPlan.budget - tripPlan.totalCost).toFixed(2)}` : `Over budget by: $${(tripPlan.totalCost - tripPlan.budget).toFixed(2)}`}

Check out your detailed itinerary below! You can drag and drop activities to reorder them, edit details, or remove activities you don't want.`;
  };

  const handleEditActivity = async (dayId: string, activity: Activity) => {
    if (!user || !currentTripPlan) return;

    const result = await aiTripPlannerService.updateActivity(
      user.id,
      currentTripPlan.id,
      dayId,
      activity.id,
      activity
    );

    if (result.success) {
      setCurrentTripPlan((prev) => {
        if (!prev) return prev;

        const updatedItinerary = prev.itinerary.map((day) => {
          if (day.id === dayId) {
            const updatedActivities = day.activities.map((a) =>
              a.id === activity.id ? activity : a
            );
            const totalCost = updatedActivities.reduce((sum, a) => sum + (a.cost || 0), 0);
            return { ...day, activities: updatedActivities, totalCost };
          }
          return day;
        });

        const totalCost = updatedItinerary.reduce((sum, day) => sum + day.totalCost, 0);

        return { ...prev, itinerary: updatedItinerary, totalCost };
      });

      showToast('Activity updated successfully', 'success');
    } else {
      showToast('Failed to update activity', 'error');
    }
  };

  const handleDeleteActivity = async (dayId: string, activityId: string) => {
    if (!user || !currentTripPlan) return;

    const result = await aiTripPlannerService.deleteActivity(
      user.id,
      currentTripPlan.id,
      dayId,
      activityId
    );

    if (result.success) {
      setCurrentTripPlan((prev) => {
        if (!prev) return prev;

        const updatedItinerary = prev.itinerary.map((day) => {
          if (day.id === dayId) {
            const updatedActivities = day.activities.filter((a) => a.id !== activityId);
            const totalCost = updatedActivities.reduce((sum, a) => sum + (a.cost || 0), 0);
            return { ...day, activities: updatedActivities, totalCost };
          }
          return day;
        });

        const totalCost = updatedItinerary.reduce((sum, day) => sum + day.totalCost, 0);

        return { ...prev, itinerary: updatedItinerary, totalCost };
      });

      showToast('Activity deleted successfully', 'success');
    } else {
      showToast('Failed to delete activity', 'error');
    }
  };

  const handleReorderActivities = async (dayId: string, activities: Activity[]) => {
    if (!user || !currentTripPlan) return;

    const result = await aiTripPlannerService.reorderActivities(
      user.id,
      currentTripPlan.id,
      dayId,
      activities
    );

    if (result.success) {
      setCurrentTripPlan((prev) => {
        if (!prev) return prev;

        const updatedItinerary = prev.itinerary.map((day) => {
          if (day.id === dayId) {
            return { ...day, activities };
          }
          return day;
        });

        return { ...prev, itinerary: updatedItinerary };
      });

      showToast('Activities reordered', 'success');
    } else {
      showToast('Failed to reorder activities', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Trip Planner
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Describe your dream vacation and let AI create the perfect itinerary for you
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-[600px] flex flex-col">
              <ChatInterface
                messages={messages}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
              />
            </div>

            {currentTripPlan && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Your Itinerary
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Drag to reorder activities</span>
                  </div>
                </div>

                {currentTripPlan.itinerary.map((dayItinerary) => (
                  <DailyItineraryCard
                    key={dayItinerary.id}
                    itinerary={dayItinerary}
                    onEditActivity={(activity) =>
                      handleEditActivity(dayItinerary.id, activity)
                    }
                    onDeleteActivity={(activityId) =>
                      handleDeleteActivity(dayItinerary.id, activityId)
                    }
                    onReorderActivities={(activities) =>
                      handleReorderActivities(dayItinerary.id, activities)
                    }
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <BudgetTracker tripPlan={currentTripPlan} />
          </div>
        </div>
      </div>
    </div>
  );
}
