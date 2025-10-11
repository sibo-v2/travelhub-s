import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Calendar as CalendarIcon,
  Smartphone,
  Share2,
} from 'lucide-react';
import { TripPlan } from '../../services/aiTripPlannerService';
import { DayItineraryView } from './DayItineraryView';
import { itineraryExportService } from '../../services/itineraryExportService';
import { useToast } from '../../contexts/ToastContext';

interface ItineraryViewProps {
  tripPlan: TripPlan;
}

export function ItineraryView({ tripPlan }: ItineraryViewProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const { showToast } = useToast();

  const currentDay = tripPlan.itinerary[currentDayIndex];

  const handlePrevDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  const handleNextDay = () => {
    if (currentDayIndex < tripPlan.itinerary.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  const handleExport = (format: 'pdf' | 'google' | 'ics' | 'wallet') => {
    try {
      switch (format) {
        case 'pdf':
          itineraryExportService.exportToPDF(tripPlan);
          showToast('Opening print dialog for PDF export...', 'success');
          break;
        case 'google':
          itineraryExportService.exportToGoogleCalendar(tripPlan);
          showToast('Opening Google Calendar...', 'success');
          break;
        case 'ics':
          itineraryExportService.exportToICS(tripPlan);
          showToast('Calendar file downloaded successfully!', 'success');
          break;
        case 'wallet':
          itineraryExportService.exportToAppleWallet(tripPlan);
          break;
      }
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export error:', error);
      showToast('Failed to export itinerary', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {tripPlan.destination}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(tripPlan.startDate).toLocaleDateString()} -{' '}
                {new Date(tripPlan.endDate).toLocaleDateString()} • {tripPlan.travelers}{' '}
                {tripPlan.travelers === 1 ? 'Traveler' : 'Travelers'}
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white rounded-lg font-semibold shadow-lg transition-all"
              >
                <Download className="w-5 h-5" />
                Export
              </button>

              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20">
                    <div className="p-2">
                      <button
                        onClick={() => handleExport('pdf')}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                      >
                        <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            Export as PDF
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Print or save as PDF
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleExport('google')}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                      >
                        <CalendarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            Google Calendar
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Add to Google Calendar
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleExport('ics')}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                      >
                        <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            Calendar File (.ics)
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Works with all calendars
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleExport('wallet')}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                      >
                        <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            Apple Wallet
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Add to Apple Wallet
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {tripPlan.itinerary.map((day, index) => (
              <button
                key={day.id}
                onClick={() => setCurrentDayIndex(index)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold transition-all ${
                  index === currentDayIndex
                    ? 'bg-gradient-to-r from-sky-600 to-emerald-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-sky-500 dark:hover:border-sky-500'
                }`}
              >
                Day {day.day}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <DayItineraryView itinerary={currentDay} destination={tripPlan.destination} />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevDay}
            disabled={currentDayIndex === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-sky-500 dark:hover:border-sky-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous Day
          </button>

          <div className="text-gray-600 dark:text-gray-400 font-semibold">
            Day {currentDay.day} of {tripPlan.itinerary.length}
          </div>

          <button
            onClick={handleNextDay}
            disabled={currentDayIndex === tripPlan.itinerary.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-sky-500 dark:hover:border-sky-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700"
          >
            Next Day
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-sky-900/20 dark:to-emerald-900/20 border border-sky-200 dark:border-sky-800 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">Trip Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Budget</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${tripPlan.budget.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated Cost</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${tripPlan.totalCost.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {tripPlan.totalCost > tripPlan.budget ? 'Over Budget' : 'Remaining'}
              </div>
              <div
                className={`text-2xl font-bold ${
                  tripPlan.totalCost > tripPlan.budget
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                ${Math.abs(tripPlan.budget - tripPlan.totalCost).toFixed(2)}
              </div>
            </div>
          </div>

          {tripPlan.suggestions && tripPlan.suggestions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-sky-200 dark:border-sky-800">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Travel Tips
              </h4>
              <ul className="space-y-1">
                {tripPlan.suggestions.slice(0, 3).map((suggestion, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                  >
                    <span className="text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                      •
                    </span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
