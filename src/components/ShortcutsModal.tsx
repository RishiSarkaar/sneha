import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '1', desc: 'Navigate to Vehicle Finder' },
    { key: '2', desc: 'Navigate to Park a Vehicle form' },
    { key: '3', desc: 'Navigate to Interactive Garage Map' },
    { key: '4', desc: 'Navigate to Operations & Admin Roster' },
    { key: '/', desc: 'Focus global search input' },
    { key: 'd / D', desc: 'Toggle Dark / Light mode' },
    { key: '?', desc: 'Toggle Keyboard Shortcuts guide' },
    { key: 'Esc', desc: 'Close modals & overlays' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl p-6 text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Command className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            <h2 id="shortcuts-title" className="text-base font-semibold tracking-tight">
              Keyboard Shortcuts & Accessibility
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close shortcuts modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {shortcuts.map((item) => (
            <div key={item.key} className="py-2.5 flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-300">{item.desc}</span>
              <kbd className="px-2 py-1 text-xs font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded shadow-xs">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
          <span>Accessible standard: WCAG 2.1 AA</span>
          <span>Press <kbd className="font-mono font-bold">Esc</kbd> to exit</span>
        </div>
      </div>
    </div>
  );
};
