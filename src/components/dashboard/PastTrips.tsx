import { Star, MapPin, Calendar, DollarSign, MessageCircle } from 'lucide-react';
import { UserTrip } from '../../services/dashboardService';
import { useState } from 'react';

interface PastTripsProps {
  trips: UserTrip[];
  onRefresh: () => void;
}

export function PastTrips({ trips, onRefresh }: PastTripsProps) {
  const [reviewingTrip, setReviewingTrip] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleSubmitReview = (tripId: string) => {
    console.log('Submitting review for trip:', tripId, { rating, reviewText });
    setReviewingTrip(null);
    setRating(5);
    setReviewText('');
  };

  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No past trips yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your completed trips will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {trips.map((trip) => {
        const duration = getDuration(trip.startDate, trip.endDate);
        const isReviewing = reviewingTrip === trip.id;

        return (
          <div
            key={trip.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {trip.destination}
                  </h3>
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(trip.startDate)}</span>
                    </div>
                    <span>•</span>
                    <span>{duration} days</span>
                    <span>•</span>
                    <span>${trip.totalCost.toFixed(0)}</span>
                  </div>
                </div>

                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold">
                  Completed
                </span>
              </div>

              {trip.bookings && trip.bookings.length > 0 && (
                <div className="mb-4">
                  <div className="flex gap-2 flex-wrap">
                    {trip.bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm"
                      >
                        <span>
                          {booking.type === 'flight' && '✈️'}
                          {booking.type === 'hotel' && '🏨'}
                          {booking.type === 'activity' && '🎯'}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">{booking.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isReviewing ? (
                <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                        <MessageCircle className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sky-900 dark:text-sky-100 mb-1">
                          How was your trip?
                        </h4>
                        <p className="text-sm text-sky-700 dark:text-sky-300">
                          Share your experience to help other travelers
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setReviewingTrip(trip.id)}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold transition-colors text-sm"
                    >
                      Write Review
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Write Your Review
                  </h4>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Overall Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Experience
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Tell us about your trip, what you loved, and what could be improved..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSubmitReview(trip.id)}
                      className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      Submit Review
                    </button>
                    <button
                      onClick={() => {
                        setReviewingTrip(null);
                        setRating(5);
                        setReviewText('');
                      }}
                      className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-sky-500 dark:hover:border-sky-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-sky-500 dark:hover:border-sky-500 transition-colors">
                    <MapPin className="w-4 h-4" />
                    View Details
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-sky-500 dark:hover:border-sky-500 transition-colors">
                    <Calendar className="w-4 h-4" />
                    Book Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
