export function FlightSearchSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-5 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              <div className="flex space-x-6">
                <div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>

            <div className="text-right space-y-3">
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded ml-auto"></div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FlightSearchSkeletonCompact() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-center space-x-3 mb-6">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-sky-600"></div>
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-4 flex-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FlightCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-3 flex-1">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="space-y-2">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
        <div className="h-5 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <FlightSearchSkeleton />
      </div>
    </div>
  );
}
