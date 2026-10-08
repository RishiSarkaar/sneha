import React, { useState } from 'react';
import {
  Car,
  MapPin,
  Clock,
  CheckCircle,
  FileText,
  User,
  Phone,
  Zap,
  Accessibility,
  Sparkles,
  Radio,
} from 'lucide-react';
import { ParkingDeckId, ParkingSpot, ParkedVehicle, PricingRates, VehicleCategory } from '../types/parking';
import { playAudioFeedback } from '../utils/audio';

interface ParkVehicleViewProps {
  spots: ParkingSpot[];
  onParkVehicle: (newVehicle: ParkedVehicle) => void;
  soundEnabled: boolean;
  onOpenPass: (vehicle: ParkedVehicle) => void;
  pricing: PricingRates;
}

export const ParkVehicleView: React.FC<ParkVehicleViewProps> = ({
  spots,
  onParkVehicle,
  soundEnabled,
  onOpenPass,
  pricing,
}) => {
  const [plateNumber, setPlateNumber] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [color, setColor] = useState('Polar White');
  const [vehicleType, setVehicleType] = useState<VehicleCategory>('4-Wheeler (Car/SUV)');
  const [selectedDeck, setSelectedDeck] = useState<ParkingDeckId>('G');
  const [selectedSpotId, setSelectedSpotId] = useState('');
  const [category, setCategory] = useState<ParkedVehicle['category']>('Visitor');
  const [expectedDurationHours, setExpectedDurationHours] = useState<number>(4);
  const [landmarkNote, setLandmarkNote] = useState('');
  const [driverName, setDriverName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [fastagId, setFastagId] = useState('');

  const [lastParkedVehicle, setLastParkedVehicle] = useState<ParkedVehicle | null>(null);

  // Filter available spots for chosen deck
  const availableSpotsForDeck = spots.filter(
    (s) => s.deckId === selectedDeck && s.status === 'available'
  );

  React.useEffect(() => {
    if (availableSpotsForDeck.length > 0) {
      if (!availableSpotsForDeck.some((s) => s.id === selectedSpotId)) {
        setSelectedSpotId(availableSpotsForDeck[0].id);
      }
    } else {
      setSelectedSpotId('');
    }
  }, [selectedDeck, spots]);

  const presetLandmarks = [
    'Near Metro Concourse Escalator',
    'Opposite Security Guard Post #1',
    'Beside Tata Power EV Fast Charger',
    'Adjacent to Tower A Elevators',
    'Ground Level 2-Wheeler Entry Ramp',
    'Basement 1 FASTag Exit Lane #2',
  ];

  const popularVehicles = [
    { name: 'Tata Nexon EV', type: 'EV 4-Wheeler' as VehicleCategory },
    { name: 'Ather 450X', type: 'EV 2-Wheeler' as VehicleCategory },
    { name: 'Hyundai Creta', type: '4-Wheeler (Car/SUV)' as VehicleCategory },
    { name: 'Mahindra XUV700', type: '4-Wheeler (Car/SUV)' as VehicleCategory },
    { name: 'Royal Enfield Hunter', type: '2-Wheeler (Bike/Scooter)' as VehicleCategory },
    { name: 'Ola S1 Pro', type: 'EV 2-Wheeler' as VehicleCategory },
  ];

  const handleQuickPreset = (preset: string) => {
    setLandmarkNote(preset);
    playAudioFeedback('click', soundEnabled);
  };

  const handleQuickVehicle = (v: { name: string; type: VehicleCategory }) => {
    setMakeModel(v.name);
    setVehicleType(v.type);
    if (v.type.includes('2-Wheeler')) {
      setSelectedDeck('G'); // Ground has dedicated 2W bays
    }
    playAudioFeedback('click', soundEnabled);
  };

  const handleRandomAvailableSpot = () => {
    if (availableSpotsForDeck.length > 0) {
      const randomSpot =
        availableSpotsForDeck[Math.floor(Math.random() * availableSpotsForDeck.length)];
      setSelectedSpotId(randomSpot.id);
      playAudioFeedback('click', soundEnabled);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber.trim() || !selectedSpotId) return;

    const formattedPlate = plateNumber.toUpperCase().trim();
    const randomTicketNum = Math.floor(1000 + Math.random() * 9000);
    const generatedFastag = fastagId.trim() || `NETC-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newVehicle: ParkedVehicle = {
      id: `APX-${randomTicketNum}`,
      plateNumber: formattedPlate,
      makeModel: makeModel.trim() || 'Indian Vehicle',
      color: color.trim() || 'White',
      vehicleType,
      deckId: selectedDeck,
      spotId: selectedSpotId,
      parkedAt: new Date().toISOString(),
      expectedDurationHours,
      driverName: driverName.trim() || 'Visitor Driver',
      contactPhone: contactPhone.trim(),
      fastagId: generatedFastag,
      category,
      landmarkNote: landmarkNote.trim() || `Stationed at Bay ${selectedSpotId}`,
      status: 'active',
    };

    onParkVehicle(newVehicle);
    setLastParkedVehicle(newVehicle);
    playAudioFeedback('confirm', soundEnabled);

    // Reset inputs
    setPlateNumber('');
    setMakeModel('');
    setLandmarkNote('');
    setDriverName('');
    setContactPhone('');
    setFastagId('');
  };

  const is2W = vehicleType.includes('2-Wheeler');
  const currentRate = is2W ? pricing.hourlyRateBike : pricing.hourlyRateCar;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Vehicle Check-In & FASTag RFID Registration
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Record Indian vehicle registration (HSRP), auto-link FASTag wallet, and allocate parking bay.
        </p>
      </div>

      {/* Success Banner if recently parked */}
      {lastParkedVehicle && (
        <div className="mb-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold text-sm text-emerald-950 dark:text-emerald-200">
                Vehicle {lastParkedVehicle.plateNumber} assigned to Bay {lastParkedVehicle.spotId}
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 block">
                Ticket code: {lastParkedVehicle.id} · FASTag: {lastParkedVehicle.fastagId}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPass(lastParkedVehicle)}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View & Print Pass</span>
            </button>
            <button
              onClick={() => setLastParkedVehicle(null)}
              className="px-2.5 py-1.5 text-xs text-emerald-800 dark:text-emerald-300 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Registration Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs p-6 divide-y divide-zinc-200 dark:divide-zinc-800"
      >
        {/* Section 1: Indian Vehicle Identification */}
        <div className="pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                1. Vehicle & HSRP Plate Details
              </h2>
            </div>
            {/* Quick model fill chips */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500">
              <span className="text-[11px]">Popular:</span>
              {popularVehicles.slice(0, 3).map((v) => (
                <button
                  key={v.name}
                  type="button"
                  onClick={() => handleQuickVehicle(v)}
                  className="px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 text-[11px] font-medium"
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Plate Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                Indian Registration (HSRP) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  placeholder="DL 01 AB 1234 or MH 12 CD 5678"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 uppercase placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
                />
              </div>
              <span className="text-[10px] text-zinc-400 block mt-1">
                Format: State Code + RTO + Series + 4 Digits
              </span>
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                Vehicle Category & Tariff
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleCategory)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
              >
                <option value="4-Wheeler (Car/SUV)">4-Wheeler Car / SUV (₹{pricing.hourlyRateCar}/hr)</option>
                <option value="2-Wheeler (Bike/Scooter)">2-Wheeler Bike / Scooter (₹{pricing.hourlyRateBike}/hr)</option>
                <option value="EV 4-Wheeler">EV 4-Wheeler (Tata / MG / BYD)</option>
                <option value="EV 2-Wheeler">EV 2-Wheeler (Ather / Ola / TVS)</option>
                <option value="Commercial/Cab">Commercial / App Cab (Ola/Uber)</option>
              </select>
            </div>

            {/* Make / Model */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                Make & Model
              </label>
              <input
                type="text"
                value={makeModel}
                onChange={(e) => setMakeModel(e.target.value)}
                placeholder="e.g. Tata Nexon EV, Ather 450X"
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
              />
            </div>

            {/* Vehicle Color */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                Vehicle Color
              </label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
              >
                <option value="Polar White">Polar White</option>
                <option value="Midnight Black">Midnight Black</option>
                <option value="Silver Metallic">Silver Metallic</option>
                <option value="Daytona Grey">Daytona Grey</option>
                <option value="Deep Navy Blue">Deep Navy Blue</option>
                <option value="Teal Blue (EV)">Teal Blue (EV)</option>
                <option value="Red Rage">Red Rage</option>
              </select>
            </div>

            {/* FASTag ID */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1 flex items-center justify-between">
                <span>NETC FASTag Tag ID</span>
                <span className="text-[10px] text-emerald-600 font-bold">Auto-Detected</span>
              </label>
              <div className="relative">
                <Radio className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={fastagId}
                  onChange={(e) => setFastagId(e.target.value)}
                  placeholder="e.g. NETC-3401-9921-12"
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                Permit / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ParkedVehicle['category'])}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
              >
                <option value="Visitor">Visitor (Hourly Public)</option>
                <option value="Staff/TechPark">Tech Park Employee / Staff</option>
                <option value="Executive">Executive / VIP</option>
                <option value="Monthly Pass">Monthly RFID Pass</option>
                <option value="Valet">Valet Service</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Deck & Bay Selection */}
        <div className="py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                2. Deck & Bay Allocation
              </h2>
            </div>
            <button
              type="button"
              onClick={handleRandomAvailableSpot}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Assign Nearest Stall</span>
            </button>
          </div>

          {/* Deck Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {[
              { id: 'G', name: 'Ground (G)', desc: '2-Wheeler & Fast Track' },
              { id: 'B1', name: 'Basement 1', desc: 'EV Charging Hub' },
              { id: 'B2', name: 'Basement 2', desc: 'Corporate Fleet' },
              { id: 'ROOF', name: 'Level R', desc: 'SkyDeck Rooftop' },
            ].map((deck) => {
              const freeCount = spots.filter(
                (s) => s.deckId === deck.id && s.status === 'available'
              ).length;
              const isSelected = selectedDeck === deck.id;
              return (
                <button
                  type="button"
                  key={deck.id}
                  onClick={() => {
                    setSelectedDeck(deck.id as ParkingDeckId);
                    playAudioFeedback('click', soundEnabled);
                  }}
                  className={`p-3 text-left rounded border transition-all ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <span className="font-bold text-xs block">{deck.name}</span>
                  <span
                    className={`text-[11px] block mt-0.5 ${
                      isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500'
                    }`}
                  >
                    {freeCount} bays available
                  </span>
                </button>
              );
            })}
          </div>

          {/* Available Bay Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
              Select Specific Bay on {selectedDeck} ({availableSpotsForDeck.length} vacant)
            </label>
            {availableSpotsForDeck.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {availableSpotsForDeck.map((spot) => {
                  const isChosen = selectedSpotId === spot.id;
                  return (
                    <button
                      type="button"
                      key={spot.id}
                      onClick={() => {
                        setSelectedSpotId(spot.id);
                        playAudioFeedback('click', soundEnabled);
                      }}
                      className={`p-2 rounded text-center border font-mono transition-all ${
                        isChosen
                          ? 'border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:border-blue-400 dark:text-blue-100 ring-2 ring-blue-500 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950'
                      }`}
                    >
                      <div className="text-xs font-bold">{spot.id}</div>
                      <div className="text-[10px] uppercase font-sans text-zinc-500 flex items-center justify-center gap-0.5 mt-0.5">
                        {spot.type === 'twoWheeler' && <span>🏍️ 2W</span>}
                        {spot.type === 'ev' && <Zap className="w-2.5 h-2.5 text-emerald-600" />}
                        {spot.type === 'accessible' && <Accessibility className="w-2.5 h-2.5 text-blue-600" />}
                        {spot.type === 'standard' && <span>4W</span>}
                        {spot.type === 'reserved' && <span>VIP</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-800 dark:text-rose-300 rounded">
                Deck {selectedDeck} is currently full. Please switch to another deck.
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Driver Details & Landmark */}
        <div className="py-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              3. Orientation Landmark & Driver Details
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                Physical Landmark / Orientation Hint
              </label>
              <input
                type="text"
                value={landmarkNote}
                onChange={(e) => setLandmarkNote(e.target.value)}
                placeholder="e.g. Near Tower A lobby, opposite Column C4"
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-[11px] text-zinc-400 mr-1 self-center">Presets:</span>
                {presetLandmarks.map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => handleQuickPreset(preset)}
                    className="text-[11px] px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                  Driver Name (Optional)
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                  Indian Mobile / WhatsApp (+91)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98101 23456"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Current Tariff: <strong className="text-zinc-800 dark:text-zinc-200">₹{currentRate}/hr</strong> ·
            First 30 minutes complimentary
          </div>
          <button
            type="submit"
            disabled={!plateNumber.trim() || !selectedSpotId}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-xs"
          >
            Issue Parking Pass & Lift Barrier
          </button>
        </div>
      </form>
    </div>
  );
};
