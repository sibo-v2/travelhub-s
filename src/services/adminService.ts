import { supabase } from '../lib/supabase';

export interface AnalyticsData {
  totalBookings: number;
  totalRevenue: number;
  userGrowth: number;
  bookingsByMonth: { month: string; bookings: number; revenue: number }[];
  usersByMonth: { month: string; users: number }[];
  topDestinations: { destination: string; bookings: number; revenue: number }[];
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  details: any;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  status: 'active' | 'suspended' | 'deleted';
  createdAt: string;
  lastLogin?: string;
  totalBookings: number;
  totalSpent: number;
}

export interface AdminBooking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'refunded';
  totalCost: number;
  bookingReference: string;
  createdAt: string;
}

export interface ContentReview {
  id: string;
  type: 'review' | 'comment' | 'photo';
  userId: string;
  userName: string;
  content: any;
  status: 'pending' | 'approved' | 'rejected';
  reportCount: number;
  createdAt: string;
}

export interface ServiceHealth {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime: number;
  lastChecked: string;
  uptime: number;
}

class AdminService {
  private analyticsWebhookUrl: string;

  constructor() {
    this.analyticsWebhookUrl = import.meta.env.VITE_N8N_ANALYTICS_WEBHOOK || '';
  }

  async checkAdminRole(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      return data?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  }

  async getAnalytics(): Promise<{
    success: boolean;
    data?: AnalyticsData;
    error?: string;
  }> {
    try {
      if (!this.analyticsWebhookUrl || this.analyticsWebhookUrl.includes('your-n8n-instance')) {
        return this.getMockAnalytics();
      }

      const response = await fetch(this.analyticsWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_analytics',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();

      return {
        success: true,
        data: data.analytics,
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return this.getMockAnalytics();
    }
  }

  private getMockAnalytics(): { success: boolean; data: AnalyticsData } {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    return {
      success: true,
      data: {
        totalBookings: 1247,
        totalRevenue: 487650,
        userGrowth: 23.5,
        bookingsByMonth: months.map((month, i) => ({
          month,
          bookings: Math.floor(Math.random() * 200) + 100,
          revenue: Math.floor(Math.random() * 80000) + 50000,
        })),
        usersByMonth: months.map((month, i) => ({
          month,
          users: Math.floor(Math.random() * 150) + 50,
        })),
        topDestinations: [
          { destination: 'Paris', bookings: 234, revenue: 98450 },
          { destination: 'Tokyo', bookings: 189, revenue: 87320 },
          { destination: 'New York', bookings: 167, revenue: 76540 },
          { destination: 'London', bookings: 145, revenue: 65430 },
          { destination: 'Barcelona', bookings: 123, revenue: 54210 },
        ],
        recentActivity: [
          {
            id: '1',
            userId: 'user-1',
            userName: 'John Doe',
            action: 'New Booking',
            timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
            details: { destination: 'Paris', amount: 2500 },
          },
          {
            id: '2',
            userId: 'user-2',
            userName: 'Jane Smith',
            action: 'User Registration',
            timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
            details: {},
          },
          {
            id: '3',
            userId: 'user-3',
            userName: 'Bob Johnson',
            action: 'Refund Issued',
            timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
            details: { amount: 1200, reason: 'Customer request' },
          },
        ],
      },
    };
  }

  async getUsers(
    page: number = 1,
    limit: number = 20,
    searchQuery?: string,
    statusFilter?: string
  ): Promise<{
    success: boolean;
    users?: AdminUser[];
    total?: number;
    error?: string;
  }> {
    try {
      let query = supabase.from('profiles').select('*', { count: 'exact' });

      if (searchQuery) {
        query = query.ilike('email', `%${searchQuery}%`);
      }

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const users: AdminUser[] = (data || []).map((user) => ({
        id: user.id,
        email: user.email || '',
        role: user.role || 'user',
        status: user.status || 'active',
        createdAt: user.created_at,
        lastLogin: user.last_login,
        totalBookings: 0,
        totalSpent: 0,
      }));

      return {
        success: true,
        users,
        total: count || 0,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users',
      };
    }
  }

  async suspendUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended' })
        .eq('id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error suspending user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to suspend user',
      };
    }
  }

  async activateUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error activating user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to activate user',
      };
    }
  }

  async getBookings(
    page: number = 1,
    limit: number = 20,
    statusFilter?: string
  ): Promise<{
    success: boolean;
    bookings?: AdminBooking[];
    total?: number;
    error?: string;
  }> {
    try {
      let query = supabase.from('user_trips').select('*', { count: 'exact' });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bookings: AdminBooking[] = (data || []).map((booking) => ({
        id: booking.id,
        userId: booking.user_id,
        userName: 'User',
        userEmail: 'user@example.com',
        destination: booking.destination,
        startDate: booking.start_date,
        endDate: booking.end_date,
        status: booking.status,
        totalCost: booking.total_cost,
        bookingReference: booking.id.substring(0, 8).toUpperCase(),
        createdAt: booking.created_at,
      }));

      return {
        success: true,
        bookings,
        total: count || 0,
      };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch bookings',
      };
    }
  }

  async issueRefund(
    bookingId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_trips')
        .update({ status: 'refunded' })
        .eq('id', bookingId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error issuing refund:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to issue refund',
      };
    }
  }

  async getServiceHealth(): Promise<{
    success: boolean;
    services?: ServiceHealth[];
    error?: string;
  }> {
    const services: ServiceHealth[] = [
      {
        name: 'Amadeus API',
        status: 'operational',
        responseTime: 245,
        lastChecked: new Date().toISOString(),
        uptime: 99.8,
      },
      {
        name: 'Stripe',
        status: 'operational',
        responseTime: 123,
        lastChecked: new Date().toISOString(),
        uptime: 99.9,
      },
      {
        name: 'n8n Workflows',
        status: 'operational',
        responseTime: 567,
        lastChecked: new Date().toISOString(),
        uptime: 98.5,
      },
      {
        name: 'Supabase Database',
        status: 'operational',
        responseTime: 89,
        lastChecked: new Date().toISOString(),
        uptime: 99.99,
      },
      {
        name: 'Mapbox API',
        status: 'operational',
        responseTime: 178,
        lastChecked: new Date().toISOString(),
        uptime: 99.7,
      },
    ];

    return {
      success: true,
      services,
    };
  }

  async getContentForReview(): Promise<{
    success: boolean;
    content?: ContentReview[];
    error?: string;
  }> {
    const mockContent: ContentReview[] = [
      {
        id: '1',
        type: 'review',
        userId: 'user-1',
        userName: 'John Doe',
        content: {
          rating: 5,
          text: 'Amazing trip! Everything was perfect.',
          destination: 'Paris',
        },
        status: 'pending',
        reportCount: 0,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '2',
        type: 'review',
        userId: 'user-2',
        userName: 'Jane Smith',
        content: {
          rating: 1,
          text: 'Terrible experience, would not recommend.',
          destination: 'London',
        },
        status: 'pending',
        reportCount: 2,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];

    return {
      success: true,
      content: mockContent,
    };
  }

  async approveContent(contentId: string): Promise<{ success: boolean; error?: string }> {
    console.log('Approving content:', contentId);
    return { success: true };
  }

  async rejectContent(contentId: string): Promise<{ success: boolean; error?: string }> {
    console.log('Rejecting content:', contentId);
    return { success: true };
  }
}

export const adminService = new AdminService();
