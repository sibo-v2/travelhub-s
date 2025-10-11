import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { Navigation } from './components/Navigation';
import { Landing } from './components/Landing';
import { TravelerTypeSelection } from './components/TravelerTypeSelection';
import { CreateTripForm, TripData } from './components/CreateTripForm';
import { FlightBooking } from './components/FlightBooking';
import { TravelGuide } from './components/TravelGuide';
import { HotelBooking } from './components/HotelBooking';
import { Transportation } from './components/Transportation';
import { SignUp } from './components/SignUp';
import { SignIn } from './components/SignIn';
import { Profile } from './components/Profile';
import { ForgotPassword } from './components/ForgotPassword';
import { Search } from './components/Search';
import { MyTrip } from './components/MyTrip';
import { Notes } from './components/Notes';
import { ChatAgent } from './components/ChatAgent';
import { HelpButton } from './components/HelpButton';
import { ItineraryPlanner } from './components/ItineraryPlanner';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [travelerType, setTravelerType] = useState<string | null>(null);
  const [showCreateTripForm, setShowCreateTripForm] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);

  const handleTravelerTypeSelect = (type: string) => {
    setTravelerType(type);
    setShowCreateTripForm(true);
  };

  const handleTripSubmit = (tripData: TripData, tripId: string) => {
    console.log('Trip created successfully:', tripData);
    setCurrentTripId(tripId);
    setShowCreateTripForm(false);
    setCurrentPage('itinerary');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Landing onNavigate={setCurrentPage} />;
      case 'traveler-type':
        return (
          <TravelerTypeSelection
            onSelect={handleTravelerTypeSelect}
            onBack={() => setCurrentPage('home')}
          />
        );
      case 'search':
        return <Search />;
      case 'mytrip':
        return <MyTrip />;
      case 'itinerary':
        return <ItineraryPlanner tripId={currentTripId} />;
      case 'notes':
        return <Notes />;
      case 'flights':
        return <FlightBooking />;
      case 'guide':
        return <TravelGuide />;
      case 'hotels':
        return <HotelBooking />;
      case 'transportation':
        return <Transportation />;
      case 'signup':
        return <SignUp onNavigate={setCurrentPage} />;
      case 'signin':
        return <SignIn onNavigate={setCurrentPage} />;
      case 'profile':
        return <Profile />;
      case 'forgot-password':
        return <ForgotPassword onNavigate={setCurrentPage} />;
      default:
        return <Landing onNavigate={setCurrentPage} />;
    }
  };

  const showNavigation = currentPage !== 'home' && currentPage !== 'traveler-type';

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {showNavigation && (
              <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
            )}
            {renderPage()}

            {showCreateTripForm && travelerType && (
              <CreateTripForm
                travelerType={travelerType}
                onSubmit={handleTripSubmit}
                onBack={() => {
                  setShowCreateTripForm(false);
                  setCurrentPage('traveler-type');
                }}
                onClose={() => {
                  setShowCreateTripForm(false);
                  setCurrentPage('home');
                }}
              />
            )}

            {!isChatOpen && showNavigation && <HelpButton onClick={() => setIsChatOpen(true)} />}
            {isChatOpen && <ChatAgent onClose={() => setIsChatOpen(false)} />}
          </div>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
