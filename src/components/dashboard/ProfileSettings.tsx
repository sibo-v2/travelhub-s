import { useState, useEffect } from 'react';
import { User, Bell, CreditCard, Globe, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { dashboardService, UserPreferences, PaymentMethod } from '../../services/dashboardService';

export function ProfileSettings() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    if (user) {
      loadPreferences();
      loadPaymentMethods();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    const result = await dashboardService.getUserPreferences(user.id);
    if (result.success && result.preferences) {
      setPreferences(result.preferences);
    }
    setIsLoading(false);
  };

  const loadPaymentMethods = async () => {
    if (!user) return;

    const result = await dashboardService.getPaymentMethods(user.id);
    if (result.success && result.methods) {
      setPaymentMethods(result.methods);
    }
  };

  const handleSavePreferences = async () => {
    if (!user || !preferences) return;

    setIsSaving(true);
    const result = await dashboardService.updateUserPreferences(user.id, preferences);

    if (result.success) {
      showToast('Settings saved successfully', 'success');
    } else {
      showToast('Failed to save settings', 'error');
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-sky-600 dark:text-sky-400 animate-spin" />
      </div>
    );
  }

  if (!preferences) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-sky-100 dark:bg-sky-900/20 rounded-lg">
            <User className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={user?.id || ''}
              disabled
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notification Preferences</h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Email Notifications</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Receive trip updates and booking confirmations
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={(e) =>
                setPreferences({ ...preferences, emailNotifications: e.target.checked })
              }
              className="w-5 h-5 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Push Notifications</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Get alerts on your mobile device
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.pushNotifications}
              onChange={(e) =>
                setPreferences({ ...preferences, pushNotifications: e.target.checked })
              }
              className="w-5 h-5 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Trip Reminders</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Reminders before your trips start
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.tripReminders}
              onChange={(e) =>
                setPreferences({ ...preferences, tripReminders: e.target.checked })
              }
              className="w-5 h-5 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Marketing Emails</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Receive travel deals and promotions
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.marketingEmails}
              onChange={(e) =>
                setPreferences({ ...preferences, marketingEmails: e.target.checked })
              }
              className="w-5 h-5 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
            />
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
            <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Regional Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Currency
            </label>
            <select
              value={preferences.currency}
              onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
              className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 dark:text-white"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
              className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 dark:text-white"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={preferences.timezone}
              onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
              className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 dark:text-white"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment Methods</h3>
          </div>
          <button className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold transition-colors text-sm">
            Add Card
          </button>
        </div>

        {paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-8 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white capitalize">
                      {method.brand} •••• {method.last4}
                    </div>
                    {method.expiryMonth && method.expiryYear && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.isDefault && (
                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs rounded-full font-semibold">
                      Default
                    </span>
                  )}
                  <button className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-600 dark:text-gray-400">
            No payment methods added yet
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSavePreferences}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
