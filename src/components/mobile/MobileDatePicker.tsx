import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface MobileDatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  placeholder?: string;
}

export function MobileDatePicker({
  selectedDate,
  onDateSelect,
  minDate,
  placeholder = 'Select date',
}: MobileDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate || minDate || new Date()
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDateSelect = (date: Date) => {
    onDateSelect(date);
    setIsOpen(false);
  };

  const isDateDisabled = (date: Date | null) => {
    if (!date || !minDate) return false;
    return date < minDate;
  };

  const isDateSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return placeholder;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-left touch-manipulation active:scale-98 transition-transform"
      >
        <Calendar className="w-5 h-5 text-gray-400" />
        <span
          className={`flex-1 ${
            selectedDate
              ? 'text-gray-900 dark:text-white font-medium'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {formatDate(selectedDate)}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center md:justify-center animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[80vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom md:slide-in-from-bottom-0">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Select Date
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {currentMonth.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>

                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const disabled = isDateDisabled(date);
                  const selected = isDateSelected(date);
                  const today = isToday(date);

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => !disabled && handleDateSelect(date)}
                      disabled={disabled}
                      className={`aspect-square rounded-lg text-sm font-medium transition-all touch-manipulation active:scale-95 ${
                        selected
                          ? 'bg-sky-600 text-white shadow-md'
                          : today
                          ? 'bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400'
                          : disabled
                          ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                          : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg font-semibold transition-colors touch-manipulation"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
