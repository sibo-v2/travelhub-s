import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, User, Bot } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface ChatAgentProps {
  onClose: () => void;
}

export function ChatAgent({ onClose }: ChatAgentProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your TravelHub assistant. How can I help you today? I can assist with bookings, destinations, transportation, or any questions you have about your trip.",
      sender: 'agent',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAgentResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('book') || lowerMessage.includes('reservation')) {
      return "I can help you with bookings! We offer flight bookings, hotel reservations, and transportation services. Which would you like to book? You can also visit our Flights or Transportation pages to see available options.";
    }

    if (lowerMessage.includes('flight') || lowerMessage.includes('airline')) {
      return "For flights, head to our Flights page where you can search for routes, compare prices across different classes (Economy, Business, First Class), and book instantly. We partner with major airlines worldwide to offer you the best deals.";
    }

    if (lowerMessage.includes('destination') || lowerMessage.includes('place') || lowerMessage.includes('visit')) {
      return "Looking for destinations? Check out our Travel Guide page! We have curated listings of attractions, landmarks, museums, parks, and more across popular cities worldwide. Each destination includes photos, ratings, and detailed descriptions to help you plan.";
    }

    if (lowerMessage.includes('transportation') || lowerMessage.includes('ride') || lowerMessage.includes('car')) {
      return "Need a ride? Our Transportation page offers Standard, Premium, and Shared ride options. Simply enter your origin and destination, and we'll calculate the route, distance, and pricing for you. First-time users get 20% off with code WELCOME20!";
    }

    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('payment')) {
      return "All our prices are transparent with no hidden fees. You can see exact pricing before booking on any of our service pages. We accept all major payment methods and ensure secure transactions. Would you like to know about a specific service?";
    }

    if (lowerMessage.includes('cancel') || lowerMessage.includes('refund')) {
      return "Our cancellation policy varies by service. Most bookings can be cancelled up to 24 hours before departure for a full refund. For specific details about your booking, please check your My Trip page or contact your service provider directly.";
    }

    if (lowerMessage.includes('account') || lowerMessage.includes('profile') || lowerMessage.includes('login')) {
      return user
        ? "You're currently logged in! You can manage your profile, view your bookings, and track your trips from the Profile section. Is there something specific you'd like to update?"
        : "To access personalized features like saved trips and booking history, please sign in or create an account. Click the Sign In button in the top navigation to get started.";
    }

    if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
      return "Use our unified Search page to find flights, destinations, and transportation all in one place! Just type what you're looking for, select a category filter, and we'll show you the best matches. You can also apply additional filters to refine your results.";
    }

    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're very welcome! If you have any other questions about your travel plans, feel free to ask. Have a wonderful trip! ✈️";
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return "I'm here to help! I can assist you with:\n• Booking flights, hotels, and transportation\n• Finding destinations and attractions\n• Understanding pricing and payment options\n• Managing your account and trips\n• Answering questions about our services\n\nWhat would you like help with?";
    }

    return "I'm here to assist you with all your travel needs! Could you please provide more details about what you're looking for? I can help with bookings, destinations, transportation, and general travel questions.";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    if (user) {
      await supabase.from('chat_messages').insert({
        user_id: user.id,
        message: inputMessage,
        sender: 'user',
      });
    }

    setTimeout(async () => {
      const response = await getAgentResponse(inputMessage);
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'agent',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);
      setIsTyping(false);

      if (user) {
        await supabase.from('chat_messages').insert({
          user_id: user.id,
          message: response,
          sender: 'agent',
        });
      }
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 max-h-[calc(100vh-80px)] h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700 transition-colors">
      <div className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">TravelHub Assistant</h3>
            <p className="text-xs opacity-90">Always here to help</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-white/20 rounded-full p-2 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[80%] ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user'
                    ? 'bg-sky-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {message.sender === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div>
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-tl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-none px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-end space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="bg-sky-600 hover:bg-sky-700 text-white p-3 rounded-xl transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
