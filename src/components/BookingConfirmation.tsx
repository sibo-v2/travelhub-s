import { CheckCircle, Download, Mail, Calendar, User, CreditCard, MapPin, Plane } from 'lucide-react';

interface BookingConfirmationProps {
  bookingReference: string;
  serviceName: string;
  bookingType: string;
  travelDate: string;
  returnDate?: string;
  numberOfTravelers: number;
  totalAmount: number;
  contactEmail: string;
  passengers?: Array<{ firstName: string; lastName: string }>;
  onClose: () => void;
}

export function BookingConfirmation({
  bookingReference,
  serviceName,
  bookingType,
  travelDate,
  returnDate,
  numberOfTravelers,
  totalAmount,
  contactEmail,
  passengers,
  onClose,
}: BookingConfirmationProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownload = () => {
    alert('Downloading booking confirmation...');
  };

  const handleEmailReceipt = () => {
    alert(`Confirmation sent to ${contactEmail}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-8 rounded-t-2xl text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <CheckCircle className="h-16 w-16" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-lg opacity-90">Your reservation is all set</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-sky-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-dashed border-sky-300 dark:border-sky-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Booking Reference
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-wider">
              {bookingReference}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Save this reference number for your records
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Booking Details
            </h3>

            <div className="flex items-start space-x-3">
              <Plane className="h-5 w-5 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Service</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{serviceName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{bookingType}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Travel Dates</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {formatDate(travelDate)}
                </p>
                {returnDate && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Return: {formatDate(returnDate)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Travelers</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {numberOfTravelers} {numberOfTravelers === 1 ? 'Traveler' : 'Travelers'}
                </p>
                {passengers && passengers.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {passengers.map((passenger, index) => (
                      <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
                        {index + 1}. {passenger.firstName} {passenger.lastName}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CreditCard className="h-5 w-5 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Paid</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confirmation Sent To</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{contactEmail}</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                  Next Steps
                </p>
                <ul className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <li>• Check your email for detailed confirmation and itinerary</li>
                  <li>• View and manage this booking in "My Trip" section</li>
                  <li>• Arrive at least 2 hours before departure for international flights</li>
                  <li>• Keep your booking reference handy for check-in</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>Download</span>
            </button>
            <button
              onClick={handleEmailReceipt}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Mail className="h-5 w-5" />
              <span>Email Receipt</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-sky-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-sky-700 hover:to-emerald-700 transition-all"
          >
            Continue Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
