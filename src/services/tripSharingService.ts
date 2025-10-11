import { supabase } from '../lib/supabase';
import { TripPlan } from './aiTripPlannerService';

export type PrivacyLevel = 'public' | 'private' | 'friends-only';

export interface SharedTrip {
  id: string;
  shareId: string;
  userId: string;
  tripPlanId: string;
  tripData: TripPlan;
  privacyLevel: PrivacyLevel;
  title: string;
  description?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShareOptions {
  privacyLevel: PrivacyLevel;
  customMessage?: string;
}

class TripSharingService {
  private generateShareId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shareId = '';
    for (let i = 0; i < 10; i++) {
      shareId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return shareId;
  }

  async createSharedTrip(
    userId: string,
    tripPlan: TripPlan,
    options: ShareOptions
  ): Promise<{ success: boolean; shareId?: string; shareUrl?: string; error?: string }> {
    try {
      const shareId = this.generateShareId();

      const { error } = await supabase.from('shared_trips').insert({
        share_id: shareId,
        user_id: userId,
        trip_plan_id: tripPlan.id,
        trip_data: tripPlan,
        privacy_level: options.privacyLevel,
        title: `Trip to ${tripPlan.destination}`,
        description: options.customMessage,
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      const shareUrl = `${window.location.origin}/shared/${shareId}`;

      return {
        success: true,
        shareId,
        shareUrl,
      };
    } catch (error) {
      console.error('Error creating shared trip:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create shared trip',
      };
    }
  }

  async getSharedTrip(shareId: string): Promise<{
    success: boolean;
    trip?: SharedTrip;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('shared_trips')
        .select('*')
        .eq('share_id', shareId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return { success: false, error: 'Trip not found' };
      }

      await this.incrementViewCount(shareId);

      const trip: SharedTrip = {
        id: data.id,
        shareId: data.share_id,
        userId: data.user_id,
        tripPlanId: data.trip_plan_id,
        tripData: data.trip_data as TripPlan,
        privacyLevel: data.privacy_level,
        title: data.title,
        description: data.description,
        viewCount: data.view_count,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return { success: true, trip };
    } catch (error) {
      console.error('Error fetching shared trip:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch shared trip',
      };
    }
  }

  async updateTripPrivacy(
    userId: string,
    shareId: string,
    privacyLevel: PrivacyLevel
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('shared_trips')
        .update({
          privacy_level: privacyLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('share_id', shareId)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error updating trip privacy:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update privacy',
      };
    }
  }

  async deleteSharedTrip(
    userId: string,
    shareId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('shared_trips')
        .delete()
        .eq('share_id', shareId)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting shared trip:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete shared trip',
      };
    }
  }

  async getUserSharedTrips(userId: string): Promise<{
    success: boolean;
    trips?: SharedTrip[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('shared_trips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const trips: SharedTrip[] = (data || []).map((item) => ({
        id: item.id,
        shareId: item.share_id,
        userId: item.user_id,
        tripPlanId: item.trip_plan_id,
        tripData: item.trip_data as TripPlan,
        privacyLevel: item.privacy_level,
        title: item.title,
        description: item.description,
        viewCount: item.view_count,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      return { success: true, trips };
    } catch (error) {
      console.error('Error fetching user shared trips:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch shared trips',
      };
    }
  }

  private async incrementViewCount(shareId: string): Promise<void> {
    try {
      await supabase.rpc('increment_trip_views', { share_id: shareId });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  generateSocialShareUrls(shareUrl: string, title: string, description: string) {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);

    return {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
    };
  }

  generateEmbedCode(shareUrl: string, width: number = 800, height: number = 600): string {
    return `<iframe src="${shareUrl}/embed" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;
  }

  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }
}

export const tripSharingService = new TripSharingService();
