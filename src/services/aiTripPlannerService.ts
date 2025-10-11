import { supabase } from '../lib/supabase';

export interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  duration: string;
  category: 'flight' | 'hotel' | 'restaurant' | 'activity' | 'transport';
  location?: string;
  cost?: number;
  order: number;
}

export interface DailyItinerary {
  id: string;
  day: number;
  date: string;
  activities: Activity[];
  totalCost: number;
}

export interface TripPlan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  itinerary: DailyItinerary[];
  totalCost: number;
  suggestions?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tripPlan?: TripPlan;
}

class AITripPlannerService {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = import.meta.env.VITE_N8N_AI_PLANNER_WEBHOOK || '';
  }

  async generateTripPlan(
    userId: string,
    prompt: string,
    context?: {
      destination?: string;
      budget?: number;
      startDate?: string;
      endDate?: string;
      travelers?: number;
      preferences?: string[];
    }
  ): Promise<{ success: boolean; tripPlan?: TripPlan; error?: string }> {
    try {
      if (!this.webhookUrl || this.webhookUrl.includes('your-n8n-instance')) {
        return this.generateMockTripPlan(context);
      }

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          prompt,
          context,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate trip plan');
      }

      const data = await response.json();

      if (data.tripPlan) {
        await this.saveTripPlanToDatabase(userId, data.tripPlan);
      }

      return {
        success: true,
        tripPlan: data.tripPlan,
      };
    } catch (error) {
      console.error('Error generating trip plan:', error);
      return this.generateMockTripPlan(context);
    }
  }

  private async generateMockTripPlan(context?: any): Promise<{
    success: boolean;
    tripPlan: TripPlan;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const destination = context?.destination || 'Paris, France';
    const budget = context?.budget || 3000;
    const startDate = context?.startDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = context?.endDate || new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString();

    const tripPlan: TripPlan = {
      id: `trip-${Date.now()}`,
      destination,
      startDate,
      endDate,
      budget,
      travelers: context?.travelers || 2,
      itinerary: [
        {
          id: 'day-1',
          day: 1,
          date: startDate,
          activities: [
            {
              id: 'act-1-1',
              title: 'Arrival & Hotel Check-in',
              description: 'Arrive at Charles de Gaulle Airport and transfer to hotel',
              time: '10:00 AM',
              duration: '3 hours',
              category: 'transport',
              location: 'CDG Airport',
              cost: 50,
              order: 0,
            },
            {
              id: 'act-1-2',
              title: 'Lunch at Le Comptoir',
              description: 'Traditional French cuisine in Saint-Germain',
              time: '1:00 PM',
              duration: '1.5 hours',
              category: 'restaurant',
              location: 'Saint-Germain-des-Prés',
              cost: 80,
              order: 1,
            },
            {
              id: 'act-1-3',
              title: 'Eiffel Tower Visit',
              description: 'Skip-the-line tickets to the iconic Eiffel Tower',
              time: '3:30 PM',
              duration: '2 hours',
              category: 'activity',
              location: 'Champ de Mars',
              cost: 60,
              order: 2,
            },
            {
              id: 'act-1-4',
              title: 'Seine River Cruise',
              description: 'Evening cruise with dinner and city lights',
              time: '7:00 PM',
              duration: '2.5 hours',
              category: 'activity',
              location: 'Port de la Bourdonnais',
              cost: 120,
              order: 3,
            },
          ],
          totalCost: 310,
        },
        {
          id: 'day-2',
          day: 2,
          date: new Date(new Date(startDate).getTime() + 24 * 60 * 60 * 1000).toISOString(),
          activities: [
            {
              id: 'act-2-1',
              title: 'Louvre Museum',
              description: 'Morning visit to the world-famous museum',
              time: '9:00 AM',
              duration: '3 hours',
              category: 'activity',
              location: 'Rue de Rivoli',
              cost: 45,
              order: 0,
            },
            {
              id: 'act-2-2',
              title: 'Lunch at Café de Flore',
              description: 'Historic café with classic French dishes',
              time: '12:30 PM',
              duration: '1.5 hours',
              category: 'restaurant',
              location: 'Boulevard Saint-Germain',
              cost: 70,
              order: 1,
            },
            {
              id: 'act-2-3',
              title: 'Notre-Dame & Sainte-Chapelle',
              description: 'Visit historic landmarks and stunning stained glass',
              time: '2:30 PM',
              duration: '2 hours',
              category: 'activity',
              location: 'Île de la Cité',
              cost: 30,
              order: 2,
            },
            {
              id: 'act-2-4',
              title: 'Montmartre Walking Tour',
              description: 'Explore the artistic neighborhood and Sacré-Cœur',
              time: '5:00 PM',
              duration: '2.5 hours',
              category: 'activity',
              location: 'Montmartre',
              cost: 40,
              order: 3,
            },
          ],
          totalCost: 185,
        },
        {
          id: 'day-3',
          day: 3,
          date: new Date(new Date(startDate).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          activities: [
            {
              id: 'act-3-1',
              title: 'Versailles Palace Day Trip',
              description: 'Full-day guided tour of the magnificent palace and gardens',
              time: '8:00 AM',
              duration: '7 hours',
              category: 'activity',
              location: 'Versailles',
              cost: 150,
              order: 0,
            },
            {
              id: 'act-3-2',
              title: 'Dinner at Le Jules Verne',
              description: 'Fine dining at the Eiffel Tower restaurant',
              time: '7:30 PM',
              duration: '2.5 hours',
              category: 'restaurant',
              location: 'Eiffel Tower',
              cost: 250,
              order: 1,
            },
          ],
          totalCost: 400,
        },
      ],
      totalCost: 895,
      suggestions: [
        'Consider purchasing a Paris Museum Pass for better value',
        'Book restaurants in advance during peak season',
        'Use the Metro for cost-effective transportation',
        'Visit popular attractions early morning to avoid crowds',
      ],
    };

    return {
      success: true,
      tripPlan,
    };
  }

  private async saveTripPlanToDatabase(
    userId: string,
    tripPlan: TripPlan
  ): Promise<void> {
    try {
      const { error } = await supabase.from('ai_trip_plans').insert({
        user_id: userId,
        trip_plan_id: tripPlan.id,
        destination: tripPlan.destination,
        start_date: tripPlan.startDate,
        end_date: tripPlan.endDate,
        budget: tripPlan.budget,
        travelers: tripPlan.travelers,
        itinerary: tripPlan.itinerary,
        total_cost: tripPlan.totalCost,
        suggestions: tripPlan.suggestions,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving trip plan to database:', error);
    }
  }

  async updateActivity(
    userId: string,
    tripPlanId: string,
    dayId: string,
    activityId: string,
    updates: Partial<Activity>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('ai_trip_plans')
        .select('itinerary')
        .eq('user_id', userId)
        .eq('trip_plan_id', tripPlanId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Trip plan not found');

      const itinerary = data.itinerary as DailyItinerary[];
      const dayIndex = itinerary.findIndex((d) => d.id === dayId);
      if (dayIndex === -1) throw new Error('Day not found');

      const activityIndex = itinerary[dayIndex].activities.findIndex(
        (a) => a.id === activityId
      );
      if (activityIndex === -1) throw new Error('Activity not found');

      itinerary[dayIndex].activities[activityIndex] = {
        ...itinerary[dayIndex].activities[activityIndex],
        ...updates,
      };

      itinerary[dayIndex].totalCost = itinerary[dayIndex].activities.reduce(
        (sum, a) => sum + (a.cost || 0),
        0
      );

      const totalCost = itinerary.reduce((sum, day) => sum + day.totalCost, 0);

      const { error: updateError } = await supabase
        .from('ai_trip_plans')
        .update({ itinerary, total_cost: totalCost })
        .eq('user_id', userId)
        .eq('trip_plan_id', tripPlanId);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error) {
      console.error('Error updating activity:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update activity',
      };
    }
  }

  async deleteActivity(
    userId: string,
    tripPlanId: string,
    dayId: string,
    activityId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('ai_trip_plans')
        .select('itinerary')
        .eq('user_id', userId)
        .eq('trip_plan_id', tripPlanId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Trip plan not found');

      const itinerary = data.itinerary as DailyItinerary[];
      const dayIndex = itinerary.findIndex((d) => d.id === dayId);
      if (dayIndex === -1) throw new Error('Day not found');

      itinerary[dayIndex].activities = itinerary[dayIndex].activities.filter(
        (a) => a.id !== activityId
      );

      itinerary[dayIndex].activities.forEach((activity, index) => {
        activity.order = index;
      });

      itinerary[dayIndex].totalCost = itinerary[dayIndex].activities.reduce(
        (sum, a) => sum + (a.cost || 0),
        0
      );

      const totalCost = itinerary.reduce((sum, day) => sum + day.totalCost, 0);

      const { error: updateError } = await supabase
        .from('ai_trip_plans')
        .update({ itinerary, total_cost: totalCost })
        .eq('user_id', userId)
        .eq('trip_plan_id', tripPlanId);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error) {
      console.error('Error deleting activity:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete activity',
      };
    }
  }

  async reorderActivities(
    userId: string,
    tripPlanId: string,
    dayId: string,
    activities: Activity[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('ai_trip_plans')
        .select('itinerary')
        .eq('user_id', userId)
        .eq('trip_plan_id', tripPlanId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Trip plan not found');

      const itinerary = data.itinerary as DailyItinerary[];
      const dayIndex = itinerary.findIndex((d) => d.id === dayId);
      if (dayIndex === -1) throw new Error('Day not found');

      itinerary[dayIndex].activities = activities.map((activity, index) => ({
        ...activity,
        order: index,
      }));

      const { error: updateError } = await supabase
        .from('ai_trip_plans')
        .update({ itinerary })
        .eq('user_id', userId)
        .eq('trip_plan_id', tripPlanId);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error) {
      console.error('Error reordering activities:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reorder activities',
      };
    }
  }

  async saveChatMessage(
    userId: string,
    message: ChatMessage
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('ai_chat_messages').insert({
        user_id: userId,
        message_id: message.id,
        role: message.role,
        content: message.content,
        trip_plan_id: message.tripPlan?.id,
        created_at: message.timestamp.toISOString(),
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error saving chat message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save message',
      };
    }
  }

  async getChatHistory(userId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map((msg) => ({
        id: msg.message_id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }));
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }
}

export const aiTripPlannerService = new AITripPlannerService();
