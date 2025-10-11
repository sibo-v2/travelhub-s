import { useState } from 'react';
import { Menu, X, Settings, HelpCircle, FileText, LogOut, Moon, Sun, User, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'profile', icon: User, label: 'My Profile', href: '/profile' },
    { id: 'settings', icon: Settings, label: 'Settings', href: '/settings' },
    { id: 'help', icon: HelpCircle, label: 'Help & Support', href: '/help' },
    { id: 'terms', icon: FileText, label: 'Terms & Privacy', href: '/terms' },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation md:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl z-50 animate-in slide-in-from-right">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              {user && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-full text-white font-bold text-lg">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {user.email}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        View profile
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                <nav className="p-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}

                  <div className="my-2 h-px bg-gray-200 dark:bg-gray-800" />

                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
                  >
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? (
                        <Moon className="w-5 h-5" />
                      ) : (
                        <Sun className="w-5 h-5" />
                      )}
                      <span className="font-medium">
                        {theme === 'dark' ? 'Dark' : 'Light'} Mode
                      </span>
                    </div>
                    <div className="relative inline-flex items-center h-6 w-11 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors">
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                          theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </button>

                  {user?.email && user.email.includes('admin') && (
                    <>
                      <div className="my-2 h-px bg-gray-200 dark:bg-gray-800" />
                      <button
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors touch-manipulation"
                      >
                        <Shield className="w-5 h-5" />
                        <span className="font-medium">Admin Panel</span>
                      </button>
                    </>
                  )}
                </nav>
              </div>

              {user && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg font-semibold transition-colors touch-manipulation"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
