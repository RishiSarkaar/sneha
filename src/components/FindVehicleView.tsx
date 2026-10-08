import React, { useState, useId } from 'react';
import {
  Search,
  MapPin,
  Clock,
  Navigation,
  FileText,
  LogOut,
  Share2,
  Check,
  AlertCircle,
  Zap,
  Accessibility,
  Info,
  CreditCard,
  Radio,
} from 'lucide-react';
import { ParkedVehicle, ParkingSpot, PricingRates } from '../types/parking';
import { playAudioFeedback } from '../utils/audio';

interface FindVehicleViewProps {
  vehicles: ParkedVehicle[];
  spots: ParkingSpot[];
  pricing: PricingRates;
  soundEnabled: boolean;
  onSelectSpotInMap: (spotId: string, deckId: string) => void;
  onCheckOutVehicle: (vehicleId: string) => void;
  onOpenPass: (vehicle: ParkedVehicle) => void;
  onOpenPayment: (vehicle: ParkedVehicle) => void;
  onNavigateToPark: () => void;
}

export const FindVehicleView: React.FC<FindVehicleViewProps> = ({
  vehicles,
  spots,
  pricing,
  soundEnabled,
  onSelectSpotInMap,
  onCheckOutVehicle,
  onOpenPass,
  onOpenPayment,
  onNavigateToPark,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    vehicles.length > 0 ? vehicles[0].id : ''
  );
  const [copiedShare, setCopiedShare] = useState(false);
  const searchInputId = useId();

  // Filter active vehicles based on query
  const filteredVehicles = vehicles.filter((v) => {
    if (v.status === 'departed') return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      v.plateNumber.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q) ||
      v.spotId.toLowerCase().includes(q) ||
      (v.driverName && v.driverName.toLowerCase().includes(q)) ||
      v.makeModel.toLowerCase().includes(q) ||
      (v.fastagId && v.fastagId.toLowerCase().includes(q))
    );
  });

  const activeSelectedVehicle =
    vehicles.find((v) => v.id === selectedVehicleId && v.status !== 'departed') ||
    filteredVehicles[0] ||
    null;

  // Calculate elapsed time & fees in INR
  const calculateDurationAndFee = (v: ParkedVehicle) => {
    const start = new Date(v.parkedAt).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - start);
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const is2W = v.vehicleType.includes('2-Wheeler');
    const hourlyRate = is2W ? pricing.hourlyRateBike : pricing.hourlyRateCar;

    let baseFee = 0;
    if (pricing.firstThirtyMinutesFree && totalMinutes <= 30) {
      baseFee = 0;
    } else {
      const billableHours = Math.max(1, Math.ceil(totalMinutes / 60));
      baseFee = Math.min(billableHours * hourlyRate, pricing.dailyMaximum);
      if (hours >= v.expectedDurationHours && v.status === 'overstay') {
        const overstayHours = hours - v.expectedDurationHours;
        baseFee += overstayHours * pricing.overstayHourlyPenalty;
      }
    }

    const gst = Math.round(baseFee * 0.18);
    const totalFee = baseFee + gst;

    return {
      durationStr: `${hours}h ${mins}m`,
      totalHours: hours + mins / 60,
      baseFee,
      gst,
      totalFee,
      isOverstay: hours >= v.expectedDurationHours,
      ratePerHour: hourlyRate,
    };
  };

  const handleSelectVehicle = (v: ParkedVehicle) => {
    setSelectedVehicleId(v.id);
    playAudioFeedback('click', soundEnabled);
  };

  const handleShare = (v: ParkedVehicle) => {
    const text = `ApexPark India: Vehicle ${v.plateNumber} parked at Deck ${v.deckId}, Bay ${v.spotId}. Landmark: ${v.landmarkNote}`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    playAudioFeedback('confirm', soundEnabled);
    setTimeout(() => setCopiedShare(false), 2200);
  };

  const selectedSpot = activeSelectedVehicle
    ? spots.find((s) => s.id === activeSelectedVehicle.spotId)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Vehicle Locator & Walking Guide
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Trace parked 2-wheelers and 4-wheelers across Concourse & Basements with instant UPI / FASTag checkout.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToPark}
            className="px-3.5 py-2 text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-md transition-colors shadow-xs"
          >
            + Register New Vehicle
          </button>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 mb-6 shadow-xs">
        <label
          htmlFor={searchInputId}
          className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2"
        >
          Search Vehicle Database (HSRP Plate / FASTag ID / Ticket Code)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            id={searchInputId}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type Indian plate (e.g. DL 01 AB 4029, KA 05 MN 7812), ticket code (APX-5120), or stall..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 font-medium"
          />
        </div>

        {/* Quick Selection List */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Quick Lookups:</span>
          {vehicles
            .filter((v) => v.status !== 'departed')
            .slice(0, 5)
            .map((v) => (
              <button
                key={v.id}
                onClick={() => handleSelectVehicle(v)}
                className={`font-mono text-xs px-2 py-0.5 rounded border transition-colors ${
                  activeSelectedVehicle?.id === v.id
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-bold'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800'
                }`}
              >
                {v.plateNumber} · {v.spotId}
              </button>
            ))}
        </div>
      </div>

      {/* Main Grid: Found Vehicle Details & Walking Navigation */}
      {activeSelectedVehicle ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Location Specification & Identity (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="text-[11px] font-mono tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">
                    Vehicle Location Record
                  </div>
                  <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {activeSelectedVehicle.makeModel}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span>{activeSelectedVehicle.color}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeSelectedVehicle.vehicleType}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeSelectedVehicle.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">ID: {activeSelectedVehicle.id}</span>
                  </div>
                </div>

                {/* Authentic Indian High Security Registration Plate (HSRP) Graphic */}
                <div className="inline-flex items-stretch border-2 border-zinc-900 rounded bg-white overflow-hidden shadow-xs shrink-0">
                  <div className="bg-blue-700 text-white px-2 py-1 flex flex-col items-center justify-center text-[7px] font-bold">
                    <span className="text-[9px] leading-none">☸</span>
                    <span className="tracking-widest">IND</span>
                  </div>
                  <div className="px-3 py-1 font-mono text-base font-black tracking-wider text-zinc-900 flex items-center">
                    {activeSelectedVehicle.plateNumber}
                  </div>
                </div>
              </div>

              {/* Exact Bay Location Callout */}
              <div className="my-6 bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800">
                  <div className="sm:pr-4">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block">
                      Facility Deck
                    </span>
                    <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100 block mt-1">
                      Deck {activeSelectedVehicle.deckId}
                    </span>
                    <span className="text-xs text-zinc-500 block">
                      {activeSelectedVehicle.deckId === 'G'
                        ? 'Ground Concourse (2W & Fast Track)'
                        : activeSelectedVehicle.deckId === 'B1'
                        ? 'Basement 1 (EV & Executive)'
                        : activeSelectedVehicle.deckId === 'B2'
                        ? 'Basement 2 (Corporate Reserve)'
                        : 'SkyDeck Rooftop'}
                    </span>
                  </div>

                  <div className="pt-3 sm:pt-0 sm:px-4">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block">
                      Aisle & Zone
                    </span>
                    <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100 block mt-1">
                      Aisle {activeSelectedVehicle.spotId.split('-')[1]?.charAt(0) || 'A'}
                    </span>
                    <span className="text-xs text-zinc-500 block">East Wing Corridor</span>
                  </div>

                  <div className="pt-3 sm:pt-0 sm:pl-4">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block">
                      Allocated Stall #
                    </span>
                    <span className="font-mono font-black text-2xl text-blue-600 dark:text-blue-400 block mt-0.5">
                      {activeSelectedVehicle.spotId}
                    </span>
                    <span className="text-xs text-zinc-500 block">Marked Bay</span>
                  </div>
                </div>

                {/* Spot Features Banner */}
                {selectedSpot && (
                  <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
                    <div className="flex items-center gap-1.5">
                      {selectedSpot.type === 'twoWheeler' && (
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          🏍️ Dedicated Two-Wheeler Slot
                        </span>
                      )}
                      {selectedSpot.type === 'ev' && (
                        <>
                          <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            EV Fast Charging Station (60kW DC Port)
                          </span>
                        </>
                      )}
                      {selectedSpot.type === 'accessible' && (
                        <>
                          <Accessibility className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-semibold text-blue-700 dark:text-blue-400">
                            Divyangjan / Accessible Stall with ramp
                          </span>
                        </>
                      )}
                      {selectedSpot.type === 'standard' && (
                        <span>Standard 4-Wheeler Stall</span>
                      )}
                      {selectedSpot.type === 'reserved' && (
                        <span className="font-semibold text-purple-700 dark:text-purple-400">
                          Executive Corporate Reserved
                        </span>
                      )}
                    </div>

                    {activeSelectedVehicle.fastagId && (
                      <div className="font-mono text-[11px] text-zinc-500 flex items-center gap-1">
                        <Radio className="w-3 h-3 text-emerald-600" />
                        <span>FASTag: {activeSelectedVehicle.fastagId}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Landmark Memory Note */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-md p-3.5 bg-white dark:bg-zinc-900">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                      Physical Landmark & Driver Orientation Hint
                    </span>
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 mt-0.5 font-medium">
                      "{activeSelectedVehicle.landmarkNote || 'Parked in regular aisle stall'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-2.5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => onOpenPayment(activeSelectedVehicle)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white rounded transition-colors shadow-xs inline-flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay via UPI / FASTag</span>
                </button>

                <button
                  onClick={() => onOpenPass(activeSelectedVehicle)}
                  className="px-3.5 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded border border-zinc-300 dark:border-zinc-700 inline-flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Digital Pass & QR</span>
                </button>

                <button
                  onClick={() =>
                    onSelectSpotInMap(
                      activeSelectedVehicle.spotId,
                      activeSelectedVehicle.deckId
                    )
                  }
                  className="px-3.5 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded border border-zinc-300 dark:border-zinc-700 inline-flex items-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Floor Plan</span>
                </button>

                <button
                  onClick={() => handleShare(activeSelectedVehicle)}
                  className="px-3 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded border border-zinc-300 dark:border-zinc-700 inline-flex items-center gap-1.5 transition-colors"
                >
                  {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedShare ? 'Copied!' : 'Share'}</span>
                </button>

                <button
                  onClick={() => onCheckOutVehicle(activeSelectedVehicle.id)}
                  className="ml-auto px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded border border-rose-200 dark:border-rose-900 inline-flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Direct Check-Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Turn-by-Turn Directions & Tariff Ledger (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Step-by-Step Walking Navigation */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    Turn-By-Turn Walking Route
                  </h3>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">From Metro Atrium</span>
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="text-xs text-zinc-700 dark:text-zinc-300">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                      Atrium Escalator / Lift Access
                    </span>
                    From Cyber City Metro concourse, take Elevator Bank A or Escalator down to{' '}
                    <strong className="text-zinc-900 dark:text-zinc-100">Deck {activeSelectedVehicle.deckId}</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="text-xs text-zinc-700 dark:text-zinc-300">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                      Aisle Direction
                    </span>
                    Follow overhead yellow signage to{' '}
                    <strong className="text-zinc-900 dark:text-zinc-100">
                      Aisle {activeSelectedVehicle.spotId.split('-')[1]?.charAt(0) || 'A'}
                    </strong>
                    . Pass security kiosk #1.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="text-xs text-zinc-700 dark:text-zinc-300">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                      Arrival at Bay {activeSelectedVehicle.spotId}
                    </span>
                    Your {activeSelectedVehicle.color} {activeSelectedVehicle.makeModel} ({activeSelectedVehicle.plateNumber}) is stationed in bay{' '}
                    <strong className="text-blue-600 dark:text-blue-400">{activeSelectedVehicle.spotId}</strong>.
                  </div>
                </div>
              </div>

              <div className="mt-5 p-2.5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded text-[11px] text-blue-900 dark:text-blue-300 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Estimated walking time from Metro concourse: ~2 minutes.</span>
              </div>
            </div>

            {/* Indian Tariff Ledger with GST */}
            {(() => {
              const stats = calculateDurationAndFee(activeSelectedVehicle);
              return (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                        Tariff & GST Tax Ledger
                      </h3>
                    </div>
                    {stats.isOverstay && (
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        OVERSTAY
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-zinc-500">Parked Since:</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">
                        {new Date(activeSelectedVehicle.parkedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-zinc-500">Elapsed Parking Time:</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {stats.durationStr}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-zinc-500">Applicable Tariff:</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">
                        ₹{stats.ratePerHour}/hour ({activeSelectedVehicle.vehicleType})
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 text-zinc-500">
                      <span>GST (18% SAC: 996729):</span>
                      <span className="font-mono">₹{stats.gst}</span>
                    </div>

                    <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                          Total Payable Amount
                        </span>
                        <span className="text-[10px] text-zinc-400">Via UPI QR / NETC FASTag Auto-Debit</span>
                      </div>
                      <span className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        ₹{stats.totalFee}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12 text-center">
          <AlertCircle className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            No matching vehicle located
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-1">
            Please check the Indian registration number or ticket code entered above.
          </p>
        </div>
      )}
    </div>
  );
};
