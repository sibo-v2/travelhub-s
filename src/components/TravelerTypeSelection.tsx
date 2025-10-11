import { useState } from 'react';
import { Wallet, Clock, Scale } from 'lucide-react';

interface TravelerTypeSelectionProps {
  onSelect: (type: string) => void;
  onBack: () => void;
}

export function TravelerTypeSelection({ onSelect, onBack }: TravelerTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleSelect = (type: string) => {
    setSelectedType(type);
    console.log('Selected traveler type:', type);
    setTimeout(() => {
      onSelect(type);
    }, 300);
  };

  const travelerTypes = [
    {
      id: 'budget',
      title: 'Budget Friendly',
      description: 'Save money and find the best deals',
      icon: Wallet,
      gradient: 'from-emerald-400 to-teal-600',
      hoverGradient: 'hover:from-emerald-500 hover:to-teal-700',
    },
    {
      id: 'time',
      title: 'Time Conscious',
      description: 'Optimize your schedule and make every moment count',
      icon: Clock,
      gradient: 'from-blue-400 to-cyan-600',
      hoverGradient: 'hover:from-blue-500 hover:to-cyan-700',
    },
    {
      id: 'combination',
      title: 'Combination',
      description: 'Balance your time and budget for the best experience',
      icon: Scale,
      gradient: 'from-amber-400 to-orange-600',
      hoverGradient: 'hover:from-amber-500 hover:to-orange-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center px-4 py-12 animate-fadeIn">
      <div className="max-w-6xl w-full">
        <button
          onClick={onBack}
          className="mb-8 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
        >
          <svg
            className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="text-center mb-12 animate-slideDown">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Which type of traveller are you?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose your travel style to get personalized recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {travelerTypes.map((type, index) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;

            return (
              <div
                key={type.id}
                className="animate-slideUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <button
                  onClick={() => handleSelect(type.id)}
                  className={`
                    w-full h-full p-8 rounded-2xl shadow-lg
                    transform transition-all duration-300
                    hover:scale-105 hover:shadow-2xl
                    ${isSelected ? 'scale-105 ring-4 ring-white dark:ring-gray-700' : ''}
                    bg-gradient-to-br ${type.gradient} ${type.hoverGradient}
                    text-white
                    group
                  `}
                >
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                      <Icon className="w-10 h-10" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold mb-3">{type.title}</h3>
                      <p className="text-white/90 text-base leading-relaxed">
                        {type.description}
                      </p>
                    </div>

                    <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="inline-flex items-center text-sm font-medium">
                        Select this option
                        <svg
                          className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
