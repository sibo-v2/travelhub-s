import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { bookingService, BookingDetails, PassengerDetails } from '../services/bookingService';
import { FlightSearch } from './FlightSearch';
import { FlightResults } from './FlightResults';
import { PaymentModal } from './PaymentModal';
import { BookingConfirmation } from './BookingConfirmation';
import { FlightSearchParams, FlightResult } from '../services/flightResultsService';

type ViewState = 'search' | 'results' | 'payment' | 'confirmation';

export function FlightBooking() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [currentView, setCurrentView] = useState<ViewState>('search');
  const [searchParams, setSearchParams] = useState<FlightSearchParams | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (params: FlightSearchParams) => {
    setSearching(true);
    setSearchParams(params);

    setTimeout(() => {
      setSearching(false);
      setCurrentView('results');
    }, 1000);
  };

  const handleSelectFlight = (flight: FlightResult) => {
    if (!user) {
      showToast('Please sign in to book flights', 'warning');
      return;
    }
    setSelectedFlight(flight);
    setCurrentView('payment');
  };

  const handlePaymentConfirm = async (paymentDetails: any) => {
    if (!selectedFlight || !user || !searchParams) return;

    const bookingDetails: BookingDetails = {
      bookingType: 'flight',
      serviceName: `${selectedFlight.airline} ${selectedFlight.flightNumber} - ${selectedFlight.origin} to ${selectedFlight.destination}`,
      serviceDetails: {
        airline: selectedFlight.airline,
        flightNumber: selectedFlight.flightNumber,
        origin: selectedFlight.origin,
        destination: selectedFlight.destination,
        departureTime: selectedFlight.departureTime,
        arrivalTime: selectedFlight.arrivalTime,
        classType: selectedFlight.cabinClass,
        stops: selectedFlight.stops,
        duration: selectedFlight.duration,
      },
      travelDate: selectedFlight.departureTime,
      returnDate: selectedFlight.arrivalTime,
      numberOfTravelers: searchParams.passengers.adults + searchParams.passengers.children + searchParams.passengers.infants,
      totalAmount: selectedFlight.price * (searchParams.passengers.adults + searchParams.passengers.children + searchParams.passengers.infants),
      contactEmail: user.email || '',
      flightId: selectedFlight.id,
    };

    const passengers: PassengerDetails[] = [];
    for (let i = 0; i < searchParams.passengers.adults; i++) {
      passengers.push({ firstName: 'Adult', lastName: `${i + 1}` });
    }
    for (let i = 0; i < searchParams.passengers.children; i++) {
      passengers.push({ firstName: 'Child', lastName: `${i + 1}` });
    }
    for (let i = 0; i < searchParams.passengers.infants; i++) {
      passengers.push({ firstName: 'Infant', lastName: `${i + 1}` });
    }

    const result = await bookingService.createBooking(
      user.id,
      bookingDetails,
      passengers,
      paymentDetails
    );

    if (result.success && result.booking) {
      setBookingData(result.booking);
      setCurrentView('confirmation');
      showToast('Booking confirmed successfully!', 'success');
    } else {
      showToast('Booking failed. Please try again.', 'error');
    }
  };

  const handleBackToSearch = () => {
    setCurrentView('search');
    setSearchParams(null);
    setSelectedFlight(null);
  };

  const handleBackToResults = () => {
    setCurrentView('results');
    setSelectedFlight(null);
  };

  const handleCloseConfirmation = () => {
    setCurrentView('search');
    setBookingData(null);
    setSelectedFlight(null);
    setSearchParams(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {currentView === 'search' && (
        <div className="relative h-screen flex items-center justify-center overflow-hidden">
          <img
            src="https://images.pexels.com/photos/62623/wing-plane-flying-airplane-62623.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Airplane wing during flight"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center mb-8">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                Find Your Perfect Flight
              </h1>
              <p className="text-xl md:text-2xl text-white/90 drop-shadow-lg">
                Search and compare flights from hundreds of airlines
              </p>
            </div>

            <FlightSearch onSearch={handleSearch} loading={searching} />
          </div>
        </div>
      )}

      {currentView === 'results' && searchParams && (
        <FlightResults
          searchParams={searchParams}
          onBack={handleBackToSearch}
          onSelectFlight={handleSelectFlight}
        />
      )}

      {currentView === 'payment' && selectedFlight && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <PaymentModal
            amount={selectedFlight.price * (searchParams?.passengers.adults || 1 + (searchParams?.passengers.children || 0) + (searchParams?.passengers.infants || 0))}
            serviceName={`${selectedFlight.airline} ${selectedFlight.flightNumber}`}
            onConfirm={handlePaymentConfirm}
            onCancel={handleBackToResults}
          />
        </div>
      )}

      {currentView === 'confirmation' && bookingData && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <BookingConfirmation
            bookingReference={bookingData.booking_reference}
            serviceName={bookingData.service_name}
            bookingType={bookingData.booking_type}
            travelDate={bookingData.travel_date}
            returnDate={bookingData.return_date}
            numberOfTravelers={bookingData.number_of_travelers}
            totalAmount={bookingData.total_amount}
            contactEmail={bookingData.contact_email}
            onClose={handleCloseConfirmation}
          />
        </div>
      )}
    </div>
  );
}
