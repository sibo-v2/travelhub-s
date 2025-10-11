import { useState } from 'react';
import { Code, Copy, Check } from 'lucide-react';
import { tripSharingService } from '../../services/tripSharingService';

interface EmbedCodeGeneratorProps {
  shareUrl: string;
}

export function EmbedCodeGenerator({ shareUrl }: EmbedCodeGeneratorProps) {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [copied, setCopied] = useState(false);

  const embedCode = tripSharingService.generateEmbedCode(shareUrl, width, height);

  const handleCopy = async () => {
    const success = await tripSharingService.copyToClipboard(embedCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Code className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Embed on Your Website
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Width (px)
          </label>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(parseInt(e.target.value) || 800)}
            min="300"
            max="1200"
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Height (px)
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(parseInt(e.target.value) || 600)}
            min="300"
            max="1200"
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="relative">
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-4 overflow-x-auto">
          <code className="text-sm text-gray-800 dark:text-gray-200 font-mono break-all">
            {embedCode}
          </code>
        </div>

        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-sky-900 dark:text-sky-200 mb-2">
          Preview
        </h4>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div
            className="bg-gray-100 dark:bg-gray-900 rounded flex items-center justify-center text-gray-500 dark:text-gray-400"
            style={{ width: Math.min(width, 400), height: Math.min(height, 300) }}
          >
            <div className="text-center">
              <Code className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Embedded Trip View</p>
              <p className="text-xs">{width}×{height}px</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <p>• Copy the embed code and paste it into your website's HTML</p>
        <p>• The embedded view is responsive and works on all devices</p>
        <p>• Visitors can view the trip without leaving your site</p>
      </div>
    </div>
  );
}
