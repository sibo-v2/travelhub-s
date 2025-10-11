import { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, Loader2 } from 'lucide-react';
import { TripPlan } from '../../services/aiTripPlannerService';
import { tripSharingService, PrivacyLevel } from '../../services/tripSharingService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { PrivacyToggle } from './PrivacyToggle';
import { SocialShareButtons } from './SocialShareButtons';
import { EmbedCodeGenerator } from './EmbedCodeGenerator';

interface ShareTripModalProps {
  tripPlan: TripPlan;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareTripModal({ tripPlan, isOpen, onClose }: ShareTripModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'link' | 'social' | 'embed'>('link');
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('public');
  const [customMessage, setCustomMessage] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsGenerated(false);
      setShareUrl('');
      setActiveTab('link');
    }
  }, [isOpen]);

  const handleGenerateLink = async () => {
    if (!user) {
      showToast('Please sign in to share trips', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await tripSharingService.createSharedTrip(user.id, tripPlan, {
        privacyLevel,
        customMessage: customMessage || undefined,
      });

      if (result.success && result.shareUrl) {
        setShareUrl(result.shareUrl);
        setIsGenerated(true);
        showToast('Share link generated successfully!', 'success');
      } else {
        showToast('Failed to generate share link', 'error');
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      showToast('Failed to generate share link', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    const success = await tripSharingService.copyToClipboard(shareUrl);
    if (success) {
      setCopiedLink(true);
      showToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      showToast('Failed to copy link', 'error');
    }
  };

  const handlePrivacyChange = async (newPrivacy: PrivacyLevel) => {
    setPrivacyLevel(newPrivacy);

    if (isGenerated && user) {
      const shareId = shareUrl.split('/').pop();
      if (shareId) {
        await tripSharingService.updateTripPrivacy(user.id, shareId, newPrivacy);
        showToast('Privacy settings updated', 'success');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-lg">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Share Your Trip
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tripPlan.destination}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'link'
                ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Share Link
          </button>
          <button
            onClick={() => setActiveTab('social')}
            disabled={!isGenerated}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'social'
                ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            Social Media
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            disabled={!isGenerated}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'embed'
                ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            Embed Code
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'link' && (
            <div className="space-y-6">
              <PrivacyToggle privacyLevel={privacyLevel} onChange={handlePrivacyChange} />

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Custom Message (Optional)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Add a personal message to share with your trip..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                />
              </div>

              {!isGenerated ? (
                <button
                  onClick={handleGenerateLink}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-5 h-5" />
                      Generate Share Link
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Your Share Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-5 h-5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Share this link with anyone to let them view your trip
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'social' && isGenerated && (
            <SocialShareButtons
              shareUrl={shareUrl}
              title={`Check out my trip to ${tripPlan.destination}!`}
              description={customMessage || `I'm planning an amazing ${tripPlan.itinerary.length}-day trip to ${tripPlan.destination}. Take a look at my itinerary!`}
            />
          )}

          {activeTab === 'embed' && isGenerated && (
            <EmbedCodeGenerator shareUrl={shareUrl} />
          )}
        </div>
      </div>
    </div>
  );
}
