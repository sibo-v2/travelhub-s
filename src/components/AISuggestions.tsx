import { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { openaiService, SuggestionRequest } from '../services/openaiService';

interface AISuggestionsProps {
  context: string;
  title?: string;
  userQuery?: string;
  maxSuggestions?: number;
  className?: string;
  autoLoad?: boolean;
}

export function AISuggestions({
  context,
  title = 'AI Suggestions',
  userQuery,
  maxSuggestions = 3,
  className = '',
  autoLoad = false,
}: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (autoLoad) {
      loadSuggestions();
    }
  }, [autoLoad, context]);

  const loadSuggestions = async () => {
    setLoading(true);
    setError(null);
    setIsVisible(true);

    try {
      const request: SuggestionRequest = {
        context,
        userQuery,
        maxSuggestions,
      };

      const results = await openaiService.generateTravelSuggestions(request);
      setSuggestions(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load suggestions';
      setError(errorMessage);
      console.error('Error loading AI suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isVisible) {
      loadSuggestions();
    } else {
      setIsVisible(false);
    }
  };

  if (!isVisible && !autoLoad) {
    return (
      <button
        onClick={handleToggle}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-lg font-medium shadow-md transition-all ${className}`}
      >
        <Sparkles className="w-4 h-4" />
        Get AI Suggestions
      </button>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border-2 border-violet-200 dark:border-violet-800 rounded-xl p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {!autoLoad && (
          <button
            onClick={() => setIsVisible(false)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Hide
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-violet-600 dark:text-violet-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-medium">Generating suggestions...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-red-900 dark:text-red-200 mb-1">
              Unable to load suggestions
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
          </div>
        </div>
      )}

      {!loading && !error && suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-violet-200 dark:border-violet-700 hover:border-violet-400 dark:hover:border-violet-500 transition-colors"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-bold">
                {index + 1}
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed pt-0.5">
                {suggestion}
              </p>
            </div>
          ))}
          <button
            onClick={loadSuggestions}
            className="w-full py-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
          >
            Generate new suggestions
          </button>
        </div>
      )}
    </div>
  );
}
