import { useState, useEffect, useRef } from 'react';
import { Plane, Calendar as CalendarIcon, Users, MapPin, Plus, X, Search } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

interface FlightLeg {
  id: string;
  origin: string;
  destination: string;
  departureDate: Date | null;
}

interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

interface FlightSearchProps {
  onSearch: (searchParams: any) => void;
  loading?: boolean;
}

export function FlightSearch({ onSearch, loading = false }: FlightSearchProps) {
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway' | 'multicity'>('roundtrip');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [multiCityLegs, setMultiCityLegs] = useState<FlightLeg[]>([
    { id: '1', origin: '', destination: '', departureDate: null },
    { id: '2', origin: '', destination: '', departureDate: null },
  ]);

  const [passengers, setPassengers] = useState<PassengerCounts>({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [cabinClass, setCabinClass] = useState<'economy' | 'premium' | 'business' | 'first'>('economy');

  const [airports, setAirports] = useState<Airport[]>([]);
  const [originSuggestions, setOriginSuggestions] = useState<Airport[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Airport[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [activeMultiCityField, setActiveMultiCityField] = useState<{ legId: string; field: 'origin' | 'destination' } | null>(null);
  const [multiCitySuggestions, setMultiCitySuggestions] = useState<Airport[]>([]);

  const passengerDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/airports.json')
      .then((res) => res.json())
      .then((data) => setAirports(data))
      .catch((err) => console.error('Error loading airports:', err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (passengerDropdownRef.current && !passengerDropdownRef.current.contains(event.target as Node)) {
        setShowPassengerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterAirports = (query: string): Airport[] => {
    if (!query || query.length < 2) return [];

    const searchTerm = query.toLowerCase();
    return airports.filter(
      (airport) =>
        airport.code.toLowerCase().includes(searchTerm) ||
        airport.name.toLowerCase().includes(searchTerm) ||
        airport.city.toLowerCase().includes(searchTerm) ||
        airport.country.toLowerCase().includes(searchTerm)
    ).slice(0, 8);
  };

  const handleOriginChange = (value: string) => {
    setOrigin(value);
    const suggestions = filterAirports(value);
    setOriginSuggestions(suggestions);
    setShowOriginSuggestions(suggestions.length > 0);
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    const suggestions = filterAirports(value);
    setDestinationSuggestions(suggestions);
    setShowDestinationSuggestions(suggestions.length > 0);
  };

  const handleMultiCityChange = (legId: string, field: 'origin' | 'destination', value: string) => {
    setMultiCityLegs((prev) =>
      prev.map((leg) => (leg.id === legId ? { ...leg, [field]: value } : leg))
    );

    const suggestions = filterAirports(value);
    setMultiCitySuggestions(suggestions);
    setActiveMultiCityField(suggestions.length > 0 ? { legId, field } : null);
  };

  const selectAirport = (airport: Airport, type: 'origin' | 'destination') => {
    const displayValue = `${airport.city} (${airport.code})`;
    if (type === 'origin') {
      setOrigin(displayValue);
      setShowOriginSuggestions(false);
    } else {
      setDestination(displayValue);
      setShowDestinationSuggestions(false);
    }
  };

  const selectMultiCityAirport = (airport: Airport, legId: string, field: 'origin' | 'destination') => {
    const displayValue = `${airport.city} (${airport.code})`;
    setMultiCityLegs((prev) =>
      prev.map((leg) => (leg.id === legId ? { ...leg, [field]: displayValue } : leg))
    );
    setActiveMultiCityField(null);
  };

  const addMultiCityLeg = () => {
    setMultiCityLegs((prev) => [
      ...prev,
      { id: Date.now().toString(), origin: '', destination: '', departureDate: null },
    ]);
  };

  const removeMultiCityLeg = (legId: string) => {
    if (multiCityLegs.length > 2) {
      setMultiCityLegs((prev) => prev.filter((leg) => leg.id !== legId));
    }
  };

  const updatePassengerCount = (type: keyof PassengerCounts, increment: boolean) => {
    setPassengers((prev) => {
      const currentCount = prev[type];
      const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);

      if (type === 'adults' && newCount < 1) return prev;
      if (type === 'infants' && newCount > prev.adults) return prev;

      return { ...prev, [type]: newCount };
    });
  };

  const getTotalPassengers = () => {
    return passengers.adults + passengers.children + passengers.infants;
  };

  const handleSearch = () => {
    if (tripType === 'multicity') {
      const hasEmptyFields = multiCityLegs.some(
        (leg) => !leg.origin || !leg.destination || !leg.departureDate
      );
      if (hasEmptyFields) {
        alert('Please fill in all multi-city flight details');
        return;
      }
    } else {
      if (!origin || !destination || !departureDate) {
        alert('Please fill in all required fields');
        return;
      }
      if (tripType === 'roundtrip' && !returnDate) {
        alert('Please select a return date');
        return;
      }
    }

    const searchParams = {
      tripType,
      origin,
      destination,
      departureDate,
      returnDate,
      multiCityLegs: tripType === 'multicity' ? multiCityLegs : null,
      passengers,
      cabinClass,
    };

    onSearch(searchParams);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Plane className="w-6 h-6 text-sky-600 dark:text-sky-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Search Flights</h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setTripType('roundtrip')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            tripType === 'roundtrip'
              ? 'bg-sky-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Round Trip
        </button>
        <button
          onClick={() => setTripType('oneway')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            tripType === 'oneway'
              ? 'bg-sky-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          One Way
        </button>
        <button
          onClick={() => setTripType('multicity')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            tripType === 'multicity'
              ? 'bg-sky-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Multi-City
        </button>
      </div>

      {tripType !== 'multicity' ? (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 z-10" />
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  onFocus={() => origin && setShowOriginSuggestions(true)}
                  placeholder="City or airport"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              {showOriginSuggestions && originSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                  {originSuggestions.map((airport) => (
                    <button
                      key={airport.code}
                      onClick={() => selectAirport(airport, 'origin')}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {airport.city} ({airport.code})
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {airport.name}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-500">{airport.country}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 z-10" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  onFocus={() => destination && setShowDestinationSuggestions(true)}
                  placeholder="City or airport"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                  {destinationSuggestions.map((airport) => (
                    <button
                      key={airport.code}
                      onClick={() => selectAirport(airport, 'destination')}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {airport.city} ({airport.code})
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {airport.name}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-500">{airport.country}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Departure
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                <DatePicker
                  selected={departureDate}
                  onChange={(date) => setDepartureDate(date)}
                  minDate={new Date()}
                  dateFormat="MMM dd, yyyy"
                  placeholderText="Select date"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {tripType === 'roundtrip' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Return
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                  <DatePicker
                    selected={returnDate}
                    onChange={(date) => setReturnDate(date)}
                    minDate={departureDate || new Date()}
                    dateFormat="MMM dd, yyyy"
                    placeholderText="Select date"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {multiCityLegs.map((leg, index) => (
            <div key={leg.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Flight {index + 1}</h3>
                {multiCityLegs.length > 2 && (
                  <button
                    onClick={() => removeMultiCityLeg(leg.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    From
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 z-10" />
                    <input
                      type="text"
                      value={leg.origin}
                      onChange={(e) => handleMultiCityChange(leg.id, 'origin', e.target.value)}
                      placeholder="City or airport"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  {activeMultiCityField?.legId === leg.id &&
                    activeMultiCityField?.field === 'origin' &&
                    multiCitySuggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                        {multiCitySuggestions.map((airport) => (
                          <button
                            key={airport.code}
                            onClick={() => selectMultiCityAirport(airport, leg.id, 'origin')}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                          >
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">
                              {airport.city} ({airport.code})
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {airport.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    To
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 z-10" />
                    <input
                      type="text"
                      value={leg.destination}
                      onChange={(e) => handleMultiCityChange(leg.id, 'destination', e.target.value)}
                      placeholder="City or airport"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  {activeMultiCityField?.legId === leg.id &&
                    activeMultiCityField?.field === 'destination' &&
                    multiCitySuggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                        {multiCitySuggestions.map((airport) => (
                          <button
                            key={airport.code}
                            onClick={() => selectMultiCityAirport(airport, leg.id, 'destination')}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                          >
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">
                              {airport.city} ({airport.code})
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {airport.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                    <DatePicker
                      selected={leg.departureDate}
                      onChange={(date) =>
                        setMultiCityLegs((prev) =>
                          prev.map((l) => (l.id === leg.id ? { ...l, departureDate: date } : l))
                        )
                      }
                      minDate={new Date()}
                      dateFormat="MMM dd, yyyy"
                      placeholderText="Select date"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addMultiCityLeg}
            className="flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Another Flight
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div className="relative" ref={passengerDropdownRef}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Passengers
          </label>
          <button
            onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-400" />
              <span>
                {getTotalPassengers()} Passenger{getTotalPassengers() !== 1 ? 's' : ''}
              </span>
            </div>
          </button>

          {showPassengerDropdown && (
            <div className="absolute z-30 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Adults</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">12+ years</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updatePassengerCount('adults', false)}
                      disabled={passengers.adults <= 1}
                      className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                      {passengers.adults}
                    </span>
                    <button
                      onClick={() => updatePassengerCount('adults', true)}
                      className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Children</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">2-11 years</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updatePassengerCount('children', false)}
                      disabled={passengers.children <= 0}
                      className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                      {passengers.children}
                    </span>
                    <button
                      onClick={() => updatePassengerCount('children', true)}
                      className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Infants</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Under 2 years</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updatePassengerCount('infants', false)}
                      disabled={passengers.infants <= 0}
                      className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                      {passengers.infants}
                    </span>
                    <button
                      onClick={() => updatePassengerCount('infants', true)}
                      disabled={passengers.infants >= passengers.adults}
                      className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cabin Class
          </label>
          <select
            value={cabinClass}
            onChange={(e) => setCabinClass(e.target.value as any)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white appearance-none"
          >
            <option value="economy">Economy</option>
            <option value="premium">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={loading}
        className="w-full mt-6 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            Searching...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Search Flights
          </>
        )}
      </button>
    </div>
  );
}
