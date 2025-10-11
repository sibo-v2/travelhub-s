import { MessageCircle } from 'lucide-react';

interface HelpButtonProps {
  onClick: () => void;
}

export function HelpButton({ onClick }: HelpButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3 z-40 transition-all duration-300 hover:scale-105 group"
      aria-label="Open help chat"
    >
      <div className="relative">
        <MessageCircle className="h-5 w-5 transform group-hover:scale-110 transition-transform" />
        <MessageCircle className="h-5 w-5 absolute -top-1 -left-1 opacity-50 transform group-hover:scale-110 transition-transform" />
      </div>
      <span className="font-semibold text-sm">Help</span>
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
    </button>
  );
}
