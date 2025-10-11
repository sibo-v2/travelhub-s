import { useState, useEffect } from 'react';
import { Plane, User, LogIn, MapPin, Clock, Sun, Moon, Search, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [location, setLocation] = useState('Loading...');
  const [currentTime, setCurrentTime] = useState('');

  const mainNavItems = [
    { id: 'home', label: 'Home' },
    { id: 'flights', label: 'Flights' },
    { id: 'guide', label: 'Travel Guide' },
    { id: 'hotels', label: 'Hotels' },
    { id: 'transportation', label: 'Transportation' },
  ];

  const secondaryNavItems = [
    { id: 'search', label: 'Search', icon: Search },
    { id: 'mytrip', label: 'My Trip' },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'notes', label: 'Notes', icon: FileText },
  ];

  useEffect(() => {
    const getLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setLocation(`${data.city}, ${data.region}`);
      } catch (error) {
        setLocation('Location unavailable');
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-md z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <Plane className="h-8 w-8 text-sky-600 dark:text-sky-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">TravelHub</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {mainNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400'
                }`}
              >
                {item.label}
              </button>
            ))}

            {user ? (
              <button
                onClick={() => onNavigate('profile')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'profile'
                    ? 'bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('signin')}
                className="flex items-center space-x-2 bg-sky-600 dark:bg-sky-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          <div className="md:hidden">
            <button className="text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center h-12">
          <div className="hidden md:flex items-center space-x-4">
            {secondaryNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'bg-sky-600 dark:bg-sky-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <MapPin className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span className="text-sm font-medium">{location}</span>
            </div>

            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <Clock className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span className="text-sm font-medium font-mono">{currentTime}</span>
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
