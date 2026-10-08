import React, { useState, useEffect, useCallback } from 'react';
import {
  ParkingDeckId,
  ParkingSpot,
  ParkedVehicle,
  PricingRates,
  PaymentTransaction,
} from './types/parking';
import {
  INITIAL_DECKS,
  INITIAL_PRICING,
  generateInitialSpots,
  generateInitialVehicles,
} from './data/initialData';
import { Header } from './components/Header';
import { AccessibilityToolbar } from './components/AccessibilityToolbar';
import { FindVehicleView } from './components/FindVehicleView';
import { ParkVehicleView } from './components/ParkVehicleView';
import { GarageMapView } from './components/GarageMapView';
import { AdminView } from './components/AdminView';
import { ParkingPassModal } from './components/ParkingPassModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { PaymentModal } from './components/PaymentModal';
import { playAudioFeedback } from './utils/audio';

const STORAGE_KEYS = {
  VEHICLES: 'apexpark_vehicles_in_v2',
  SPOTS: 'apexpark_spots_in_v2',
  PRICING: 'apexpark_pricing_in_v2',
  THEME: 'apexpark_theme_in_v2',
  FONT_SIZE: 'apexpark_font_size_in_v2',
  HIGH_CONTRAST: 'apexpark_high_contrast_in_v2',
  SOUND: 'apexpark_sound_in_v2',
};

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved !== null) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // A11y states
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.FONT_SIZE) as 'normal' | 'large' | 'xlarge') || 'normal';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.HIGH_CONTRAST) === 'true';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
    return saved !== null ? saved === 'true' : true;
  });

  // Modals state
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [passModalVehicle, setPassModalVehicle] = useState<ParkedVehicle | null>(null);
  const [paymentModalVehicle, setPaymentModalVehicle] = useState<ParkedVehicle | null>(null);

  // Tab navigation
  const [currentTab, setCurrentTab] = useState<'find' | 'park' | 'map' | 'admin'>('find');

  // Cross-view selection link
  const [mapSelectedSpotId, setMapSelectedSpotId] = useState<string>('G-A01');
  const [mapSelectedDeckId, setMapSelectedDeckId] = useState<ParkingDeckId>('G');

  // Live Screen Reader Announcement text
  const [announcement, setAnnouncement] = useState<string>('');

  // Primary Data states
  const [vehicles, setVehicles] = useState<ParkedVehicle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse vehicles from storage', e);
    }
    return generateInitialVehicles();
  });

  const [spots, setSpots] = useState<ParkingSpot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SPOTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse spots from storage', e);
    }
    const initial = generateInitialSpots();
    const initialVehicles = generateInitialVehicles();
    return initial.map((spot) => {
      const matched = initialVehicles.find((v) => v.spotId === spot.id && v.status !== 'departed');
      if (matched) {
        return { ...spot, status: 'occupied' as const, currentVehicleId: matched.id };
      }
      return spot;
    });
  });

  const [pricing, setPricing] = useState<PricingRates>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRICING);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse pricing from storage', e);
    }
    return INITIAL_PRICING;
  });

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  }, [isDarkMode]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND, String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(spots));
  }, [spots]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(pricing));
  }, [pricing]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if (e.key === 'Escape') {
        setShortcutsModalOpen(false);
        setPassModalVehicle(null);
        setPaymentModalVehicle(null);
      } else if (e.key === '?') {
        setShortcutsModalOpen((prev) => !prev);
      } else if (e.key === 'd' || e.key === 'D') {
        setIsDarkMode((prev) => !prev);
      } else if (e.key === '1') {
        setCurrentTab('find');
        playAudioFeedback('click', soundEnabled);
      } else if (e.key === '2') {
        setCurrentTab('park');
        playAudioFeedback('click', soundEnabled);
      } else if (e.key === '3') {
        setCurrentTab('map');
        playAudioFeedback('click', soundEnabled);
      } else if (e.key === '4') {
        setCurrentTab('admin');
        playAudioFeedback('click', soundEnabled);
      } else if (e.key === '/') {
        e.preventDefault();
        setCurrentTab('find');
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (input) input.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [soundEnabled]);

  const triggerAnnouncement = useCallback((message: string) => {
    setAnnouncement(message);
    const timer = setTimeout(() => setAnnouncement(''), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Handlers for parking actions
  const handleParkVehicle = (newVehicle: ParkedVehicle) => {
    setVehicles((prev) => [newVehicle, ...prev]);

    setSpots((prev) =>
      prev.map((s) =>
        s.id === newVehicle.spotId
          ? { ...s, status: 'occupied', currentVehicleId: newVehicle.id }
          : s
      )
    );

    triggerAnnouncement(`Vehicle ${newVehicle.plateNumber} parked in bay ${newVehicle.spotId}`);
  };

  const handleCheckOutVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    playAudioFeedback('depart', soundEnabled);

    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? { ...v, status: 'departed', checkedOutAt: new Date().toISOString() }
          : v
      )
    );

    setSpots((prev) =>
      prev.map((s) =>
        s.id === vehicle.spotId ? { ...s, status: 'available', currentVehicleId: undefined } : s
      )
    );

    triggerAnnouncement(`Vehicle ${vehicle.plateNumber} checked out. Bay ${vehicle.spotId} is now available.`);
  };

  const handlePaymentSuccess = (vehicleId: string, transaction: PaymentTransaction) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              status: 'departed',
              checkedOutAt: new Date().toISOString(),
              totalFeePaid: transaction.amount,
              paymentDetails: transaction,
            }
          : v
      )
    );

    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (vehicle) {
      setSpots((prev) =>
        prev.map((s) =>
          s.id === vehicle.spotId ? { ...s, status: 'available', currentVehicleId: undefined } : s
        )
      );
      triggerAnnouncement(`Payment of ₹${transaction.amount} received via ${transaction.method}. Exit boom opened.`);
    }
  };

  const handleSelectSpotInMap = (spotId: string, deckId: string) => {
    setMapSelectedSpotId(spotId);
    setMapSelectedDeckId(deckId as ParkingDeckId);
    setCurrentTab('map');
    playAudioFeedback('click', soundEnabled);
  };

  const handleParkAtSpotFromMap = (spotId: string, deckId: ParkingDeckId) => {
    setMapSelectedSpotId(spotId);
    setMapSelectedDeckId(deckId);
    setCurrentTab('park');
    playAudioFeedback('click', soundEnabled);
  };

  const handleResetData = () => {
    const initialV = generateInitialVehicles();
    const initialS = generateInitialSpots().map((spot) => {
      const matched = initialV.find((v) => v.spotId === spot.id && v.status !== 'departed');
      if (matched) {
        return { ...spot, status: 'occupied' as const, currentVehicleId: matched.id };
      }
      return spot;
    });
    setVehicles(initialV);
    setSpots(initialS);
    setPricing(INITIAL_PRICING);
    triggerAnnouncement('Facility records reset to Indian demonstration defaults.');
  };

  const occupiedCount = vehicles.filter((v) => v.status !== 'departed').length;

  const fontScaleClass =
    fontSize === 'large' ? 'text-[105%]' : fontSize === 'xlarge' ? 'text-[112%]' : '';

  return (
    <div
      className={`min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors ${fontScaleClass} ${
        highContrast ? 'high-contrast' : ''
      }`}
    >
      {/* Screen reader live region */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {/* Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-zinc-900 focus:text-white focus:font-semibold focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Top Accessibility & Preferences Toolbar */}
      <AccessibilityToolbar
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast((prev) => !prev)}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onOpenShortcuts={() => setShortcutsModalOpen(true)}
      />

      {/* Header */}
      <Header
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        totalSpots={spots.length}
        occupiedSpots={occupiedCount}
        soundEnabled={soundEnabled}
      />

      {/* Main Tab Content */}
      <main id="main-content" className="flex-1">
        {currentTab === 'find' && (
          <FindVehicleView
            vehicles={vehicles}
            spots={spots}
            pricing={pricing}
            soundEnabled={soundEnabled}
            onSelectSpotInMap={handleSelectSpotInMap}
            onCheckOutVehicle={handleCheckOutVehicle}
            onOpenPass={(v) => setPassModalVehicle(v)}
            onOpenPayment={(v) => setPaymentModalVehicle(v)}
            onNavigateToPark={() => setCurrentTab('park')}
          />
        )}

        {currentTab === 'park' && (
          <ParkVehicleView
            spots={spots}
            onParkVehicle={handleParkVehicle}
            soundEnabled={soundEnabled}
            onOpenPass={(v) => setPassModalVehicle(v)}
            pricing={pricing}
          />
        )}

        {currentTab === 'map' && (
          <GarageMapView
            decks={INITIAL_DECKS}
            spots={spots}
            vehicles={vehicles}
            selectedSpotIdFromParent={mapSelectedSpotId}
            selectedDeckFromParent={mapSelectedDeckId}
            soundEnabled={soundEnabled}
            onOpenPass={(v) => setPassModalVehicle(v)}
            onOpenPayment={(v) => setPaymentModalVehicle(v)}
            onCheckOutVehicle={handleCheckOutVehicle}
            onParkAtSpot={handleParkAtSpotFromMap}
          />
        )}

        {currentTab === 'admin' && (
          <AdminView
            vehicles={vehicles}
            spots={spots}
            pricing={pricing}
            onUpdatePricing={setPricing}
            onCheckOutVehicle={handleCheckOutVehicle}
            onOpenPass={(v) => setPassModalVehicle(v)}
            onOpenPayment={(v) => setPaymentModalVehicle(v)}
            onResetData={handleResetData}
            soundEnabled={soundEnabled}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 py-6 text-xs text-zinc-500 dark:text-zinc-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
              APEXPARK INDIA
            </span>
            <span>·</span>
            <span>NPCI NETC FASTag & UPI Automated Multi-Deck Facility</span>
            <span>·</span>
            <span>GSTIN: 27AABCA1234F1Z5</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Control Room: 1800-120-PARK</span>
            <span>·</span>
            <button
              onClick={() => setShortcutsModalOpen(true)}
              className="hover:text-zinc-900 dark:hover:text-zinc-200 underline"
            >
              Accessibility & Keybinds
            </button>
            <span>·</span>
            <span>WCAG 2.1 AA Compliant</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ParkingPassModal
        vehicle={passModalVehicle}
        isOpen={Boolean(passModalVehicle)}
        onClose={() => setPassModalVehicle(null)}
        pricing={pricing}
        soundEnabled={soundEnabled}
        onOpenPayment={(v) => setPaymentModalVehicle(v)}
      />

      <PaymentModal
        vehicle={paymentModalVehicle}
        isOpen={Boolean(paymentModalVehicle)}
        onClose={() => setPaymentModalVehicle(null)}
        pricing={pricing}
        soundEnabled={soundEnabled}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <ShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </div>
  );
}
