import { Plus, Minus, Maximize2, Navigation, Layers } from 'lucide-react';
import { useState } from 'react';

interface TouchFriendlyMapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onFullscreen?: () => void;
  onLayerChange?: (layer: string) => void;
}

export function TouchFriendlyMapControls({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onFullscreen,
  onLayerChange,
}: TouchFriendlyMapControlsProps) {
  const [showLayers, setShowLayers] = useState(false);
  const [activeLayer, setActiveLayer] = useState('default');

  const layers = [
    { id: 'default', name: 'Default', icon: '🗺️' },
    { id: 'satellite', name: 'Satellite', icon: '🛰️' },
    { id: 'terrain', name: 'Terrain', icon: '⛰️' },
  ];

  const handleLayerSelect = (layerId: string) => {
    setActiveLayer(layerId);
    onLayerChange?.(layerId);
    setShowLayers(false);
  };

  return (
    <div className="absolute bottom-20 md:bottom-4 right-4 z-10 flex flex-col gap-2">
      {showLayers && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-2 animate-in slide-in-from-bottom">
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => handleLayerSelect(layer.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors touch-manipulation ${
                activeLayer === layer.id
                  ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{layer.icon}</span>
              <span className="font-medium">{layer.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={onZoomIn}
          className="p-3 md:p-4 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation active:scale-95"
          aria-label="Zoom in"
        >
          <Plus className="w-6 h-6" />
        </button>

        <div className="h-px bg-gray-200 dark:bg-gray-700" />

        <button
          onClick={onZoomOut}
          className="p-3 md:p-4 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation active:scale-95"
          aria-label="Zoom out"
        >
          <Minus className="w-6 h-6" />
        </button>
      </div>

      <button
        onClick={onRecenter}
        className="p-3 md:p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation active:scale-95"
        aria-label="Recenter map"
      >
        <Navigation className="w-6 h-6" />
      </button>

      {onLayerChange && (
        <button
          onClick={() => setShowLayers(!showLayers)}
          className={`p-3 md:p-4 rounded-xl shadow-lg border transition-colors touch-manipulation active:scale-95 ${
            showLayers
              ? 'bg-sky-600 border-sky-600 text-white'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          aria-label="Change map layer"
        >
          <Layers className="w-6 h-6" />
        </button>
      )}

      {onFullscreen && (
        <button
          onClick={onFullscreen}
          className="p-3 md:p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation active:scale-95 md:hidden"
          aria-label="Fullscreen"
        >
          <Maximize2 className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
