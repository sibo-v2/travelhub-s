import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, MessageSquarePlus } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  location: string;
  rating: number;
  review: string;
  tripType: string;
  image: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    location: "Seattle, WA",
    rating: 5,
    review: "TravelHub made planning my European vacation absolutely seamless! From booking flights to finding the perfect hotels and local transportation, everything was in one place. The AI travel guide gave me insider tips I couldn't find anywhere else.",
    tripType: "European Adventure",
    image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    id: 2,
    name: "James Rodriguez",
    location: "Miami, FL",
    rating: 5,
    review: "I've used many travel apps, but TravelHub is by far the best. The integrated booking system saved me hours of research, and the price comparisons helped me stay within budget. The trip notes feature kept everything organized perfectly.",
    tripType: "Business Trip to NYC",
    image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    id: 3,
    name: "Emily Chen",
    location: "San Francisco, CA",
    rating: 5,
    review: "As a frequent traveler, I appreciate how TravelHub brings everything together. The transportation booking feature is a game-changer, and being able to chat with the AI assistant for recommendations made my solo trip to Japan worry-free and amazing!",
    tripType: "Solo Japan Journey",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    id: 4,
    name: "Michael Thompson",
    location: "Austin, TX",
    rating: 5,
    review: "Planning a family vacation with kids can be stressful, but TravelHub simplified everything. We found kid-friendly hotels, booked all our flights, and even arranged airport transfers all in one platform. Our Disney trip was unforgettable!",
    tripType: "Family Disney Vacation",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    id: 5,
    name: "Priya Patel",
    location: "Boston, MA",
    rating: 5,
    review: "The attention to detail on TravelHub is incredible. I loved how I could save my favorite destinations, keep notes about each place, and have everything synced across my devices. Made my honeymoon to the Maldives truly special and stress-free.",
    tripType: "Maldives Honeymoon",
    image: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    id: 6,
    name: "David Kim",
    location: "Los Angeles, CA",
    rating: 5,
    review: "I travel internationally for work every month, and TravelHub has become my go-to platform. The ability to manage multiple trips, track expenses in my notes, and quickly rebook familiar routes saves me countless hours. Highly recommend for business travelers!",
    tripType: "International Business",
    image: "https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=300"
  }
];

export function ReviewCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const reviewsPerPage = 3;

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + reviewsPerPage;
        return nextIndex >= reviews.length ? 0 : nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => {
      const newIndex = prev - reviewsPerPage;
      return newIndex < 0 ? Math.max(0, reviews.length - reviewsPerPage) : newIndex;
    });
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => {
      const nextIndex = prev + reviewsPerPage;
      return nextIndex >= reviews.length ? 0 : nextIndex;
    });
  };

  const visibleReviews = reviews.slice(currentIndex, currentIndex + reviewsPerPage);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const currentPage = Math.floor(currentIndex / reviewsPerPage);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-gray-900 dark:to-gray-800 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Loved by Travelers Worldwide
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            See what our community has to say about their TravelHub experience
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col h-full"
              >
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>

                <div className="flex flex-col items-center mb-4">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-16 h-16 rounded-full object-cover mb-3 ring-4 ring-blue-100 dark:ring-blue-900"
                  />
                  <div className="font-semibold text-base text-gray-900 dark:text-white">
                    {review.name}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    {review.location}
                  </div>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4 flex-grow text-center">
                  "{review.review}"
                </p>

                <div className="mt-auto flex justify-center">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                    {review.tripType}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white dark:bg-gray-700 rounded-full p-3 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous reviews"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-6 w-6 text-gray-800 dark:text-white" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white dark:bg-gray-700 rounded-full p-3 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next reviews"
            disabled={currentIndex + reviewsPerPage >= reviews.length}
          >
            <ChevronRight className="h-6 w-6 text-gray-800 dark:text-white" />
          </button>

          <div className="flex justify-center items-center space-x-2 mt-8">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(index * reviewsPerPage);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentPage
                    ? 'w-8 bg-blue-600 dark:bg-blue-400'
                    : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-8 text-gray-700 dark:text-gray-300 mb-8">
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">50,000+</div>
              <div className="text-sm">Happy Travelers</div>
            </div>
            <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">4.9/5</div>
              <div className="text-sm">Average Rating</div>
            </div>
            <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">100+</div>
              <div className="text-sm">Countries Visited</div>
            </div>
          </div>

          <div className="mt-8">
            <button className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <MessageSquarePlus className="h-5 w-5 mr-2" />
              Share Your Experience
            </button>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Have a great trip with TravelHub? We'd love to hear from you!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
