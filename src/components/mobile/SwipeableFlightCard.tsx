import { useState, useRef, TouchEvent } from 'react';
import { Plane, Clock, DollarSign, ChevronRight } from 'lucide-react';

interface FlightData {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    time: string;
    city: string;
  };
  arrival: {
    airport: string;
    time: string;
    city: string;
  };
  duration: string;
  price: number;
  stops: number;
}

interface SwipeableFlightCardProps {
  flight: FlightData;
  onSelect: (flight: FlightData) => void;
  onSave: (flight: FlightData) => void;
}

export function SwipeableFlightCard({ flight, onSelect, onSave }: SwipeableFlightCardProps) {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    const distance = touchStart - e.targetTouches[0].clientX;
    if (distance > 0 && distance < 100) {
      setSwipeOffset(distance);
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;

    if (isLeftSwipe) {
      setIsRevealed(true);
      setSwipeOffset(100);
    } else {
      setIsRevealed(false);
      setSwipeOffset(0);
    }
  };

  const handleSave = () => {
    onSave(flight);
    setIsRevealed(false);
    setSwipeOffset(0);
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-3">
      <div className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-center bg-sky-500">
        <button
          onClick={handleSave}
          className="text-white font-semibold text-sm"
        >
          Save
        </button>
      </div>

      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(-${swipeOffset}px)`,
          transition: touchEnd === 0 ? 'none' : 'transform 0.3s ease-out',
        }}
        className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-sky-100 dark:bg-sky-900/20 rounded-lg">
                <Plane className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {flight.airline}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {flight.flightNumber}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${flight.price}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">per person</div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {flight.departure.time}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {flight.departure.airport}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {flight.departure.city}
              </div>
            </div>

            <div className="flex flex-col items-center px-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {flight.duration}
              </div>
              <div className="h-px w-16 bg-gray-300 dark:bg-gray-600 relative">
                <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90" />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
              </div>
            </div>

            <div className="flex-1 text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {flight.arrival.time}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {flight.arrival.airport}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {flight.arrival.city}
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelect(flight)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg font-semibold transition-colors"
          >
            Select Flight
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
