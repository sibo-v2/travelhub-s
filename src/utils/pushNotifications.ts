import { supabase } from '../lib/supabase';

export interface PushSubscriptionData {
  userId: string;
  subscription: PushSubscription;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications are not supported in this browser');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    const permission = await requestNotificationPermission();

    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    const registration = await navigator.serviceWorker.ready;

    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      return existingSubscription;
    }

    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY ||
      'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xQmrEcxe6T-dxRJzW8FLqvHJZNlMF8F3vqOvFXF8jXRvP9k-5yL6o';

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    await savePushSubscription(subscription);

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      await removePushSubscription(subscription);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

async function savePushSubscription(subscription: PushSubscription): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const subscriptionData = {
      user_id: user.id,
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: arrayBufferToBase64(subscription.getKey('auth'))
      },
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id,endpoint'
      });

    if (error) {
      console.error('Failed to save push subscription:', error);
    }
  } catch (error) {
    console.error('Error saving push subscription:', error);
  }
}

async function removePushSubscription(subscription: PushSubscription): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', subscription.endpoint);

    if (error) {
      console.error('Failed to remove push subscription:', error);
    }
  } catch (error) {
    console.error('Error removing push subscription:', error);
  }
}

export async function sendBookingNotification(
  bookingId: string,
  title: string,
  message: string,
  data?: any
): Promise<void> {
  try {
    if (Notification.permission !== 'granted') {
      return;
    }

    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification(title, {
      body: message,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      vibrate: [200, 100, 200],
      tag: `booking-${bookingId}`,
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Booking'
        },
        {
          action: 'close',
          title: 'Dismiss'
        }
      ],
      data: {
        bookingId,
        url: `/trips/${bookingId}`,
        ...data
      }
    });
  } catch (error) {
    console.error('Failed to send booking notification:', error);
  }
}

export async function checkNotificationSupport(): Promise<{
  supported: boolean;
  permission: NotificationPermission | null;
  serviceWorkerReady: boolean;
}> {
  const supported = 'Notification' in window && 'serviceWorker' in navigator;
  const permission = supported ? Notification.permission : null;

  let serviceWorkerReady = false;
  if (supported) {
    try {
      await navigator.serviceWorker.ready;
      serviceWorkerReady = true;
    } catch {
      serviceWorkerReady = false;
    }
  }

  return {
    supported,
    permission,
    serviceWorkerReady
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';

  const bytes = new Uint8Array(buffer);
  let binary = '';

  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return window.btoa(binary);
}
