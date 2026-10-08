import React, { useState } from 'react';
import {
  Layers,
  MapPin,
  Zap,
  Accessibility,
  CheckCircle2,
  Car,
  FileText,
  LogOut,
  Navigation,
  Info,
  Shield,
  Filter,
  CreditCard,
} from 'lucide-react';
import { ParkingDeckId, ParkingSpot, ParkedVehicle, FacilityDeck } from '../types/parking';
import { playAudioFeedback } from '../utils/audio';

interface GarageMapViewProps {
  decks: FacilityDeck[];
  spots: ParkingSpot[];
  vehicles: ParkedVehicle[];
  selectedSpotIdFromParent?: string;
  selectedDeckFromParent?: string;
  soundEnabled: boolean;
  onOpenPass: (vehicle: ParkedVehicle) => void;
  onOpenPayment: (vehicle: ParkedVehicle) => void;
  onCheckOutVehicle: (vehicleId: string) => void;
  onParkAtSpot: (spotId: string, deckId: ParkingDeckId) => void;
}

export const GarageMapView: React.FC<GarageMapViewProps> = ({
  decks,
  spots,
  vehicles,
  selectedSpotIdFromParent,
  selectedDeckFromParent,
  soundEnabled,
  onOpenPass,
  onOpenPayment,
  onCheckOutVehicle,
  onParkAtSpot,
}) => {
  const [currentDeckId, setCurrentDeckId] = useState<ParkingDeckId>(
    (selectedDeckFromParent as ParkingDeckId) || 'G'
  );
  const [activeSpotId, setActiveSpotId] = useState<string>(
    selectedSpotIdFromParent || 'G-A01'
  );
  const [typeFilter, setTypeFilter] = useState<'all' | 'available' | 'twoWheeler' | 'ev' | 'accessible'>('all');

  React.useEffect(() => {
    if (selectedDeckFromParent) {
      setCurrentDeckId(selectedDeckFromParent as ParkingDeckId);
    }
    if (selectedSpotIdFromParent) {
      setActiveSpotId(selectedSpotIdFromParent);
    }
  }, [selectedDeckFromParent, selectedSpotIdFromParent]);

  const currentDeck = decks.find((d) => d.id === currentDeckId) || decks[0];
  const deckSpots = spots.filter((s) => s.deckId === currentDeckId);

  const visibleSpots = deckSpots.filter((s) => {
    if (typeFilter === 'available') return s.status === 'available';
    if (typeFilter === 'twoWheeler') return s.type === 'twoWheeler';
    if (typeFilter === 'ev') return s.type === 'ev';
    if (typeFilter === 'accessible') return s.type === 'accessible';
    return true;
  });

  const totalDeckSpots = deckSpots.length;
  const occupiedDeckSpots = deckSpots.filter((s) => s.status === 'occupied').length;
  const availableDeckSpots = totalDeckSpots - occupiedDeckSpots;
  const evTotal = deckSpots.filter((s) => s.type === 'ev').length;
  const evAvailable = deckSpots.filter((s) => s.type === 'ev' && s.status === 'available').length;
  const twoWTotal = deckSpots.filter((s) => s.type === 'twoWheeler').length;
  const twoWAvailable = deckSpots.filter((s) => s.type === 'twoWheeler' && s.status === 'available').length;

  const activeSpot = deckSpots.find((s) => s.id === activeSpotId);
  const activeSpotVehicle = activeSpot?.currentVehicleId
    ? vehicles.find((v) => v.id === activeSpot?.currentVehicleId && v.status !== 'departed')
    : null;

  const handleSpotClick = (spot: ParkingSpot) => {
    setActiveSpotId(spot.id);
    playAudioFeedback('click', soundEnabled);
  };

  const aisles = Array.from(new Set(deckSpots.map((s) => s.aisle))).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Interactive Deck Floor Plan
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time Indian IT park garage floor layout, FASTag sensors, and 2W/4W bay telemetry.
          </p>
        </div>

        {/* Deck Level Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          {decks.map((deck) => (
            <button
              key={deck.id}
              onClick={() => {
                setCurrentDeckId(deck.id);
                const firstOnDeck = spots.find((s) => s.deckId === deck.id);
                if (firstOnDeck) setActiveSpotId(firstOnDeck.id);
                playAudioFeedback('click', soundEnabled);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                currentDeckId === deck.id
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {deck.levelCode}
            </button>
          ))}
        </div>
      </div>

      {/* Deck Telemetry Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                {currentDeck.name}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Clearance: {currentDeck.clearanceHeight}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {currentDeck.description}
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <div className="inline-flex rounded-md p-0.5 bg-zinc-100 dark:bg-zinc-800 text-xs flex-wrap">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  typeFilter === 'all'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                All ({totalDeckSpots})
              </button>
              <button
                onClick={() => setTypeFilter('available')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  typeFilter === 'available'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Vacant ({availableDeckSpots})
              </button>
              {twoWTotal > 0 && (
                <button
                  onClick={() => setTypeFilter('twoWheeler')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    typeFilter === 'twoWheeler'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  🏍️ 2W ({twoWAvailable}/{twoWTotal})
                </button>
              )}
              <button
                onClick={() => setTypeFilter('ev')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  typeFilter === 'ev'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                EV ({evAvailable}/{evTotal})
              </button>
              <button
                onClick={() => setTypeFilter('accessible')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  typeFilter === 'accessible'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Divyangjan
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs border border-emerald-500 bg-emerald-50 dark:bg-emerald-950" />
              <span>Vacant Bay</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs border border-zinc-700 bg-zinc-800 dark:bg-zinc-700" />
              <span>Occupied Bay</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span>🏍️ Two-Wheeler Slot</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-emerald-600" />
              <span>Tata Power EV DC Port</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span>Deck Highlights:</span>
            {currentDeck.features.map((f, i) => (
              <span key={i} className="text-zinc-700 dark:text-zinc-300">
                {f}
                {i < currentDeck.features.length - 1 ? ' ·' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Floor Plan Grid & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Floor Plan Visual Representation (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-dashed border-zinc-200 dark:border-zinc-800 mb-6 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 font-bold uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded text-[10px]">
                METRO ENTRY ELEVATOR A
              </span>
              <span>Concourse Lobby</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded text-[10px]">
                NETC FASTAG BOOM BARRIER
              </span>
              <span>Express Lane</span>
            </div>
          </div>

          {/* Aisles Container */}
          <div className="space-y-6">
            {aisles.map((aisle) => {
              const aisleSpots = deckSpots.filter((s) => s.aisle === aisle);
              return (
                <div key={aisle} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
                      AISLE {aisle} · {aisle === 'A' && currentDeckId === 'G' ? 'TWO-WHEELER WING ➔' : 'DRIVE LANE ➔'}
                    </span>
                    <span className="text-[10px] text-zinc-400">Max Speed 10 km/h</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {aisleSpots.map((spot) => {
                      const isSelected = activeSpotId === spot.id;
                      const isOccupied = spot.status === 'occupied';
                      const vehicle = isOccupied
                        ? vehicles.find((v) => v.id === spot.currentVehicleId)
                        : null;
                      const matchesFilter = visibleSpots.some((s) => s.id === spot.id);

                      return (
                        <button
                          key={spot.id}
                          onClick={() => handleSpotClick(spot)}
                          disabled={!matchesFilter}
                          className={`relative p-2.5 rounded text-left border flex flex-col justify-between h-24 transition-all ${
                            !matchesFilter ? 'opacity-25 pointer-events-none' : ''
                          } ${
                            isSelected
                              ? 'ring-2 ring-blue-600 dark:ring-blue-400 border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm'
                              : isOccupied
                              ? 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200'
                              : 'border-emerald-300 dark:border-emerald-800/80 bg-white dark:bg-zinc-900 hover:border-emerald-500'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {spot.id}
                            </span>
                            <div>
                              {spot.type === 'twoWheeler' && (
                                <span className="text-xs" title="Two-Wheeler Slot">🏍️</span>
                              )}
                              {spot.type === 'ev' && (
                                <span title="Tata Power EV Stall">
                                  <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                </span>
                              )}
                              {spot.type === 'accessible' && (
                                <span title="Divyangjan Stall">
                                  <Accessibility className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                </span>
                              )}
                              {spot.type === 'reserved' && (
                                <span title="Reserved Stall">
                                  <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="my-1">
                            {isOccupied && vehicle ? (
                              <div className="truncate">
                                <span className="font-mono text-[11px] font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                                  {vehicle.plateNumber}
                                </span>
                                <span className="text-[10px] text-zinc-500 block truncate">
                                  {vehicle.makeModel}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>VACANT</span>
                              </div>
                            )}
                          </div>

                          <div className="w-full flex justify-between items-center text-[9px] text-zinc-400 font-mono">
                            <span>BAY #{spot.spotNumber}</span>
                            {isSelected && (
                              <span className="text-blue-600 dark:text-blue-400 font-bold">
                                ACTIVE
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 border-b-2 border-dashed border-amber-300 dark:border-amber-600/40 w-full" />
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded text-[10px]">
                STAIRWELL B
              </span>
              <span>Tower Fire Exit</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 font-bold uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded text-[10px]">
                FASTAG EXIT TOLL GATE
              </span>
              <span>Barriers 1 & 2</span>
            </div>
          </div>
        </div>

        {/* Spot Detail Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {activeSpot ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-xs">
              <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                    Stall Inspection
                  </span>
                  <div className="font-mono text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {activeSpot.id}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    Level {activeSpot.deckId} · Aisle {activeSpot.aisle} · Stall #{activeSpot.spotNumber}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                      activeSpot.status === 'occupied'
                        ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {activeSpot.status === 'occupied' ? 'OCCUPIED' : 'VACANT'}
                  </span>
                </div>
              </div>

              {/* Spot Specifications */}
              <div className="py-4 space-y-2.5 text-xs border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Bay Category:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase">
                    {activeSpot.type === 'twoWheeler' ? '🏍️ Two-Wheeler' : activeSpot.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">EV Station:</span>
                  <span className="text-zinc-800 dark:text-zinc-200">
                    {activeSpot.type === 'ev' ? 'Tata Power 60kW DC Port' : 'Standard Port'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">FASTag Overhead Sensor:</span>
                  <span className="text-emerald-600 font-semibold">Active & Calibrated</span>
                </div>
              </div>

              {/* Occupied Vehicle Info OR Park Here */}
              {activeSpot.status === 'occupied' && activeSpotVehicle ? (
                <div className="pt-4 space-y-4">
                  <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-4">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                      Parked Vehicle
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono font-bold text-base text-zinc-900 dark:text-zinc-100">
                        {activeSpotVehicle.plateNumber}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {activeSpotVehicle.category}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mt-1">
                      {activeSpotVehicle.makeModel} ({activeSpotVehicle.color})
                    </div>
                    {activeSpotVehicle.fastagId && (
                      <div className="text-[11px] font-mono text-zinc-500 mt-1">
                        FASTag: {activeSpotVehicle.fastagId}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => onOpenPayment(activeSpotVehicle)}
                      className="w-full py-2.5 px-3 text-xs font-bold uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white rounded transition-colors shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay via UPI / FASTag</span>
                    </button>

                    <button
                      onClick={() => onOpenPass(activeSpotVehicle)}
                      className="w-full py-2 px-3 text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded border border-zinc-300 dark:border-zinc-700 inline-flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Pass & QR</span>
                    </button>

                    <button
                      onClick={() => onCheckOutVehicle(activeSpotVehicle.id)}
                      className="w-full py-2 px-3 text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded border border-rose-200 dark:border-rose-900 inline-flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Direct Release Stall</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 space-y-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Bay {activeSpot.id} is vacant</span>
                      <span className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5 block">
                        FASTag boom will open on approach.
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onParkAtSpot(activeSpot.id, activeSpot.deckId)}
                    className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-md transition-colors shadow-xs"
                  >
                    Park Vehicle in Bay {activeSpot.id}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 text-center text-zinc-500">
              Select any stall on the floor plan to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
