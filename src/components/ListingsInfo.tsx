import { Users, TrendingUp, Shield, Search, Star, BarChart3 } from 'lucide-react';

export function ListingsInfo() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Listings Matter
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our comprehensive listings system connects travelers with exceptional experiences and helps providers reach their ideal audience
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="bg-sky-100 dark:bg-sky-900 rounded-full p-3 mr-4">
                <Users className="h-8 w-8 text-sky-600 dark:text-sky-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">For Travelers</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <Search className="h-5 w-5 text-sky-600 dark:text-sky-400 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Discovery & Comparison</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Browse thousands of flights, hotels, attractions, and tours all in one place. Compare prices, features, and reviews to find the perfect match for your travel needs.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Star className="h-5 w-5 text-sky-600 dark:text-sky-400 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Informed Decision-Making</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Access essential information including pricing, availability, customer reviews, and detailed descriptions to make confident booking decisions.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Shield className="h-5 w-5 text-sky-600 dark:text-sky-400 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Easy Accessibility</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Book instantly from anywhere, anytime. Our platform makes travel planning simple, secure, and convenient with 24/7 access to worldwide offerings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="bg-emerald-100 dark:bg-emerald-900 rounded-full p-3 mr-4">
                <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">For Travel Providers</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Wider Reach & Bookings</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Connect with millions of potential customers worldwide. Expand your visibility beyond local markets and increase your booking volume significantly.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Management & Control</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Easily manage your offerings, update pricing and availability in real-time, and receive instant booking notifications to optimize operations.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Star className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Customer Interaction & Insights</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Build your reputation through customer reviews, respond to feedback, and track performance metrics to continuously improve your services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-sky-600 to-emerald-600 rounded-2xl shadow-xl p-8 md:p-12 text-white">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Building a Thriving Travel Ecosystem</h3>
            <p className="text-lg mb-6 opacity-90">
              Our listings create a vibrant marketplace that benefits everyone. By connecting travelers with unique experiences and helping providers reach their ideal customers, we're filling gaps in the travel market and creating value at every step of the journey.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">10,000+</div>
                <div className="text-sm opacity-90">Active Listings</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">500+</div>
                <div className="text-sm opacity-90">Travel Providers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">50,000+</div>
                <div className="text-sm opacity-90">Happy Travelers</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Variety & Value</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              From budget-friendly options to luxury experiences, our diverse listings ensure every traveler finds their perfect match.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
            <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Trust & Safety</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Verified listings, secure payments, and authentic reviews ensure safe and reliable travel experiences for everyone.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
            <div className="bg-amber-100 dark:bg-amber-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Market Innovation</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              We help fill gaps by connecting travelers with unique, hard-to-find services and experiences worldwide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
