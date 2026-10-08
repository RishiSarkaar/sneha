import React, { useEffect, useState } from 'react';
import { Compass, Car, Map, ShieldAlert, Sun, Moon, Activity, Radio } from 'lucide-react';
import { playAudioFeedback } from '../utils/audio';

interface HeaderProps {
  currentTab: 'find' | 'park' | 'map' | 'admin';
  onChangeTab: (tab: 'find' | 'park' | 'map' | 'admin') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  totalSpots: number;
  occupiedSpots: number;
  soundEnabled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onChangeTab,
  isDarkMode,
  onToggleDarkMode,
  totalSpots,
  occupiedSpots,
  soundEnabled,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const availableSpots = totalSpots - occupiedSpots;
  const occupancyPercent = totalSpots > 0 ? Math.round((occupiedSpots / totalSpots) * 100) : 0;

  const handleTabClick = (tab: 'find' | 'park' | 'map' | 'admin') => {
    playAudioFeedback('click', soundEnabled);
    onChangeTab(tab);
  };

  return (
    <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Indian Facility Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-zinc-900 dark:bg-zinc-100 rounded flex items-center justify-center text-white dark:text-zinc-900 shadow-xs relative">
              <span className="font-mono font-black text-sm tracking-tighter">AP</span>
              {/* Subtle tricolor dot accent */}
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white dark:border-zinc-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
                  APEXPARK
                </span>
                <span className="text-zinc-400 dark:text-zinc-500 text-[10px] font-mono font-bold uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                  BHARAT / INDIA
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 tracking-normal flex items-center gap-1.5">
                <span>Cyber City Metro Tech Concourse</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-0.5">
                  <Radio className="w-2.5 h-2.5" /> FASTag Live
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Occupancy Telemetry (IST & NETC) */}
          <div className="hidden md:flex items-center gap-6 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  occupancyPercent > 85 ? 'bg-rose-500' : 'bg-emerald-500'
                } animate-pulse`}
              />
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                Live Occupancy: {occupancyPercent}%
              </span>
              <span className="text-zinc-400">({availableSpots} of {totalSpots} Free)</span>
            </div>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

            <div className="flex items-center gap-1.5 font-mono text-zinc-700 dark:text-zinc-300">
              <Activity className="w-3.5 h-3.5 text-zinc-400" />
              <span>IST: {currentTime || '12:00:00'}</span>
            </div>
          </div>

          {/* Dark Mode toggle button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playAudioFeedback('click', soundEnabled);
                onToggleDarkMode();
              }}
              className="p-2 rounded-md text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Switch to light mode (D)' : 'Switch to dark mode (D)'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          className="flex space-x-1 border-t border-zinc-200 dark:border-zinc-800/80 -mb-px overflow-x-auto"
          aria-label="Main Navigation Tabs"
        >
          <button
            onClick={() => handleTabClick('find')}
            className={`py-3 px-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              currentTab === 'find'
                ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100 bg-zinc-50/60 dark:bg-zinc-900/60'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
            aria-current={currentTab === 'find' ? 'page' : undefined}
          >
            <Compass className="w-4 h-4" />
            <span>Find Vehicle</span>
          </button>

          <button
            onClick={() => handleTabClick('park')}
            className={`py-3 px-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              currentTab === 'park'
                ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100 bg-zinc-50/60 dark:bg-zinc-900/60'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
            aria-current={currentTab === 'park' ? 'page' : undefined}
          >
            <Car className="w-4 h-4" />
            <span>Park Vehicle / FASTag</span>
          </button>

          <button
            onClick={() => handleTabClick('map')}
            className={`py-3 px-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              currentTab === 'map'
                ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100 bg-zinc-50/60 dark:bg-zinc-900/60'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
            aria-current={currentTab === 'map' ? 'page' : undefined}
          >
            <Map className="w-4 h-4" />
            <span>Deck Floor Plan</span>
          </button>

          <button
            onClick={() => handleTabClick('admin')}
            className={`py-3 px-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              currentTab === 'admin'
                ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100 bg-zinc-50/60 dark:bg-zinc-900/60'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
            aria-current={currentTab === 'admin' ? 'page' : undefined}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Operations & GST Roster</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
