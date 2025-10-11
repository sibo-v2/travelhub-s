import { Home, Search, Calendar, User, Compass } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'discover', icon: Compass, label: 'Discover' },
    { id: 'trips', icon: Calendar, label: 'Trips' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-sky-600 dark:text-sky-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Icon
                className={`w-6 h-6 mb-1 transition-transform ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
              />
              <span
                className={`text-xs font-semibold ${
                  isActive ? 'text-sky-600 dark:text-sky-400' : ''
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
