import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { TypewriterText } from './TypewriterText';
import { ChatMessage } from '../../services/aiTripPlannerService';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const EXAMPLE_PROMPTS = [
  "Plan a 5-day romantic trip to Paris with a $3000 budget",
  "I want to explore Tokyo for a week, budget-friendly",
  "Family vacation to Orlando, 4 days, theme parks included",
  "Adventure trip to New Zealand, 10 days, outdoor activities",
  "Weekend getaway to San Francisco for food lovers",
];

export function ChatInterface({ messages, isLoading, onSendMessage }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;

    onSendMessage(inputValue.trim());
    setInputValue('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (prompt: string) => {
    setInputValue(prompt);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                AI Trip Planner
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Tell me about your dream trip and I'll create a personalized itinerary with
                activities, restaurants, and estimated costs.
              </p>
            </div>

            <div className="w-full max-w-2xl space-y-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Try these examples:
              </p>
              <div className="grid gap-2">
                {EXAMPLE_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(prompt)}
                    className="text-left p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-sky-500 dark:hover:border-sky-500 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {prompt}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-sky-600 to-emerald-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {message.role === 'assistant' && index === messages.length - 1 && isLoading ? (
                <TypewriterText
                  text={message.content}
                  speed={20}
                  className="text-gray-900 dark:text-white whitespace-pre-wrap"
                />
              ) : (
                <div
                  className={`whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'text-white'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {message.content}
                </div>
              )}

              <div
                className={`text-xs mt-2 ${
                  message.role === 'user'
                    ? 'text-white/70'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Planning your trip...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your dream trip..."
                disabled={isLoading}
                rows={1}
                className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 max-h-32 overflow-y-auto"
                style={{ minHeight: '48px' }}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}
