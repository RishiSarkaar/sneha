import React from 'react';
import { Volume2, VolumeX, Eye, HelpCircle, Sun, Moon, Type } from 'lucide-react';

interface AccessibilityToolbarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  onChangeFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenShortcuts: () => void;
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({
  isDarkMode,
  onToggleDarkMode,
  highContrast,
  onToggleHighContrast,
  fontSize,
  onChangeFontSize,
  soundEnabled,
  onToggleSound,
  onOpenShortcuts,
}) => {
  return (
    <div
      role="region"
      aria-label="Accessibility and display settings"
      className="bg-zinc-100/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-3"
    >
      <div className="flex items-center gap-4">
        <span className="font-semibold text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Preferences & A11y
        </span>

        {/* Text Size Switcher */}
        <div className="flex items-center gap-1" role="group" aria-label="Text scaling">
          <Type className="w-3.5 h-3.5 text-zinc-500" aria-hidden="true" />
          <span className="text-[11px] text-zinc-500 mr-1">Text:</span>
          <button
            onClick={() => onChangeFontSize('normal')}
            className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
              fontSize === 'normal'
                ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                : 'hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
            aria-pressed={fontSize === 'normal'}
            aria-label="Normal text size (100%)"
          >
            100%
          </button>
          <button
            onClick={() => onChangeFontSize('large')}
            className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
              fontSize === 'large'
                ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                : 'hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
            aria-pressed={fontSize === 'large'}
            aria-label="Large text size (110%)"
          >
            110%
          </button>
          <button
            onClick={() => onChangeFontSize('xlarge')}
            className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
              fontSize === 'xlarge'
                ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                : 'hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
            aria-pressed={fontSize === 'xlarge'}
            aria-label="Extra large text size (120%)"
          >
            120%
          </button>
        </div>

        {/* High Contrast Toggle */}
        <button
          onClick={onToggleHighContrast}
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition-colors border ${
            highContrast
              ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white font-bold'
              : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
          }`}
          aria-pressed={highContrast}
          aria-label="Toggle High Contrast Display Mode"
        >
          <Eye className="w-3 h-3" />
          <span>High Contrast: {highContrast ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Sound Feedback Toggle */}
        <button
          onClick={onToggleSound}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
            soundEnabled
              ? 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              : 'text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 line-through'
          }`}
          aria-pressed={soundEnabled}
          aria-label="Toggle Audio Feedback"
          title="Audio feedback tones"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>Audio Cues</span>
        </button>

        {/* Dark Mode Switch */}
        <button
          onClick={onToggleDarkMode}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          role="switch"
          aria-checked={isDarkMode}
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? (
            <>
              <Moon className="w-3 h-3 text-amber-400" />
              <span>Dark Theme</span>
            </>
          ) : (
            <>
              <Sun className="w-3 h-3 text-amber-600" />
              <span>Light Theme</span>
            </>
          )}
        </button>

        {/* Shortcuts Guide */}
        <button
          onClick={onOpenShortcuts}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Show Keyboard Shortcuts"
          title="Press '?' for shortcuts"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Shortcuts (?)</span>
        </button>
      </div>
    </div>
  );
};
