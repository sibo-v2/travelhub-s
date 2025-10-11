import { Lock, Globe, Users } from 'lucide-react';
import { PrivacyLevel } from '../../services/tripSharingService';

interface PrivacyToggleProps {
  privacyLevel: PrivacyLevel;
  onChange: (level: PrivacyLevel) => void;
}

export function PrivacyToggle({ privacyLevel, onChange }: PrivacyToggleProps) {
  const options: {
    value: PrivacyLevel;
    label: string;
    description: string;
    icon: JSX.Element;
  }[] = [
    {
      value: 'public',
      label: 'Public',
      description: 'Anyone with the link can view',
      icon: <Globe className="w-5 h-5" />,
    },
    {
      value: 'friends-only',
      label: 'Friends Only',
      description: 'Only your friends can view',
      icon: <Users className="w-5 h-5" />,
    },
    {
      value: 'private',
      label: 'Private',
      description: 'Only you can view',
      icon: <Lock className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        Privacy Settings
      </label>

      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`w-full flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left ${
              privacyLevel === option.value
                ? 'border-sky-500 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div
              className={`flex-shrink-0 ${
                privacyLevel === option.value
                  ? 'text-sky-600 dark:text-sky-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {option.icon}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`font-semibold ${
                    privacyLevel === option.value
                      ? 'text-sky-900 dark:text-sky-100'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {option.label}
                </span>
                {privacyLevel === option.value && (
                  <span className="px-2 py-0.5 bg-sky-500 text-white text-xs rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p
                className={`text-sm ${
                  privacyLevel === option.value
                    ? 'text-sky-700 dark:text-sky-300'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
        <p className="text-sm text-amber-900 dark:text-amber-200">
          {privacyLevel === 'public' && (
            <>
              <strong>Public trips</strong> can be viewed by anyone with the link and may appear
              in search results.
            </>
          )}
          {privacyLevel === 'friends-only' && (
            <>
              <strong>Friends-only trips</strong> are visible to people in your friends list who
              have the link.
            </>
          )}
          {privacyLevel === 'private' && (
            <>
              <strong>Private trips</strong> are only visible to you. Share links will not work
              for others.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
