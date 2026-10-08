import React, { useState } from 'react';
import {
  ShieldAlert,
  Download,
  Search,
  Filter,
  Car,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  FileText,
  LogOut,
  Sliders,
  Check,
  CreditCard,
  Radio,
} from 'lucide-react';
import { ParkedVehicle, ParkingSpot, PricingRates } from '../types/parking';
import { playAudioFeedback } from '../utils/audio';

interface AdminViewProps {
  vehicles: ParkedVehicle[];
  spots: ParkingSpot[];
  pricing: PricingRates;
  onUpdatePricing: (pricing: PricingRates) => void;
  onCheckOutVehicle: (vehicleId: string) => void;
  onOpenPass: (vehicle: ParkedVehicle) => void;
  onOpenPayment: (vehicle: ParkedVehicle) => void;
  onResetData: () => void;
  soundEnabled: boolean;
}

export const AdminView: React.FC<AdminViewProps> = ({
  vehicles,
  spots,
  pricing,
  onUpdatePricing,
  onCheckOutVehicle,
  onOpenPass,
  onOpenPayment,
  onResetData,
  soundEnabled,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDeck, setFilterDeck] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showRateSettings, setShowRateSettings] = useState(false);
  const [customHourlyCar, setCustomHourlyCar] = useState(pricing.hourlyRateCar);
  const [customHourlyBike, setCustomHourlyBike] = useState(pricing.hourlyRateBike);
  const [customDailyMax, setCustomDailyMax] = useState(pricing.dailyMaximum);
  const [savedRateSuccess, setSavedRateSuccess] = useState(false);

  const totalCapacity = spots.length;
  const activeVehicles = vehicles.filter((v) => v.status !== 'departed');
  const occupiedCount = activeVehicles.length;
  const occupancyPercent = totalCapacity > 0 ? Math.round((occupiedCount / totalCapacity) * 100) : 0;
  const overstayCount = activeVehicles.filter((v) => v.status === 'overstay').length;

  const evSpotsTotal = spots.filter((s) => s.type === 'ev').length;
  const evSpotsOccupied = spots.filter((s) => s.type === 'ev' && s.status === 'occupied').length;

  // Accrued revenue estimation in INR
  const totalAccruedRevenue = activeVehicles.reduce((acc, v) => {
    const start = new Date(v.parkedAt).getTime();
    const diffMs = Math.max(0, Date.now() - start);
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    if (pricing.firstThirtyMinutesFree && totalMinutes <= 30) return acc;
    const hours = Math.max(1, Math.ceil(totalMinutes / 60));
    const rate = v.vehicleType.includes('2-Wheeler') ? pricing.hourlyRateBike : pricing.hourlyRateCar;
    const base = Math.min(hours * rate, pricing.dailyMaximum);
    return acc + Math.round(base * 1.18);
  }, 0);

  const filteredVehicles = vehicles.filter((v) => {
    if (filterStatus === 'active' && v.status === 'departed') return false;
    if (filterStatus === 'departed' && v.status !== 'departed') return false;
    if (filterStatus === 'overstay' && v.status !== 'overstay') return false;
    if (filterDeck !== 'all' && v.deckId !== filterDeck) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        v.plateNumber.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q) ||
        v.spotId.toLowerCase().includes(q) ||
        (v.driverName && v.driverName.toLowerCase().includes(q)) ||
        v.makeModel.toLowerCase().includes(q) ||
        (v.fastagId && v.fastagId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    playAudioFeedback('confirm', soundEnabled);
    const headers = [
      'Ticket_ID',
      'Plate_Number_HSRP',
      'FASTag_Tag_ID',
      'Deck',
      'Bay_ID',
      'Vehicle_Model',
      'Category',
      'Parked_At_IST',
      'Expected_Hours',
      'Status',
      'Driver_Name',
      'Phone',
    ];

    const rows = vehicles.map((v) => [
      v.id,
      v.plateNumber,
      v.fastagId || 'N/A',
      v.deckId,
      v.spotId,
      `"${v.makeModel}"`,
      v.category,
      v.parkedAt,
      v.expectedDurationHours,
      v.status,
      `"${v.driverName || ''}"`,
      `"${v.contactPhone || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apexpark_india_gst_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePricing({
      ...pricing,
      hourlyRateCar: Number(customHourlyCar),
      hourlyRateBike: Number(customHourlyBike),
      dailyMaximum: Number(customDailyMax),
    });
    setSavedRateSuccess(true);
    playAudioFeedback('confirm', soundEnabled);
    setTimeout(() => setSavedRateSuccess(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Operations & GST Facility Roster
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Indian multi-level facility administration · NETC FASTag transactions · GSTIN: 27AABCA1234F1Z5
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowRateSettings(!showRateSettings)}
            className="px-3 py-1.5 text-xs font-semibold rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 inline-flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Tariff Schedule (INR)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export GST Audit CSV</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset facility data to default Indian demonstration records?')) {
                onResetData();
                playAudioFeedback('confirm', soundEnabled);
              }
            }}
            className="px-2.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Rate Card Settings Panel */}
      {showRateSettings && (
        <div className="mb-6 bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Facility Tariff Architecture (INR · ₹)
            </h3>
            {savedRateSuccess && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Tariffs Updated
              </span>
            )}
          </div>
          <form onSubmit={handleSaveRates} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">
                4-Wheeler Car Hourly (₹ INR)
              </label>
              <input
                type="number"
                step="5"
                min="10"
                value={customHourlyCar}
                onChange={(e) => setCustomHourlyCar(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-sm font-mono text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">
                2-Wheeler Bike Hourly (₹ INR)
              </label>
              <input
                type="number"
                step="5"
                min="5"
                value={customHourlyBike}
                onChange={(e) => setCustomHourlyBike(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-sm font-mono text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">
                Daily Cap (₹ INR)
              </label>
              <input
                type="number"
                step="25"
                min="100"
                value={customDailyMax}
                onChange={(e) => setCustomDailyMax(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-sm font-mono text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-4 text-xs font-bold uppercase bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded transition-colors"
              >
                Apply Tariff
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Operations Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Total Facility Capacity
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {totalCapacity}
            </span>
            <span className="text-xs text-zinc-500 font-mono">2W + 4W BAYS</span>
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {totalCapacity - occupiedCount} currently vacant
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Current Occupancy Rate
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {occupancyPercent}%
            </span>
            <span className="text-xs font-bold font-mono text-emerald-600">
              {occupiedCount} ACTIVE
            </span>
          </div>
          <div className="mt-1 text-xs text-zinc-500">Across 4 decks</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Tata Power EV Stations
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {evSpotsOccupied}/{evSpotsTotal}
            </span>
            <span className="text-xs text-zinc-500 font-mono">60kW DC PORTS</span>
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {evSpotsTotal - evSpotsOccupied} charging bays open
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Accrued Day Collections
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-black text-zinc-900 dark:text-zinc-100">
              ₹{totalAccruedRevenue}
            </span>
            <span className="text-xs text-zinc-500 font-mono">INCL 18% GST</span>
          </div>
          <div className="mt-1 text-xs text-zinc-500">FASTag & UPI Reconciliation</div>
        </div>
      </div>

      {/* Roster Table Filter Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by HSRP plate (DL/MH/KA), FASTag ID, or stall..."
              className="w-full pl-9 pr-4 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400"
            />
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 font-medium">Deck:</span>
              <select
                value={filterDeck}
                onChange={(e) => setFilterDeck(e.target.value)}
                className="px-2 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-800 dark:text-zinc-200 font-medium"
              >
                <option value="all">All Decks</option>
                <option value="G">Ground Concourse</option>
                <option value="B1">Basement 1 (EV)</option>
                <option value="B2">Basement 2 (Reserve)</option>
                <option value="ROOF">Level R (SkyDeck)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 font-medium">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-800 dark:text-zinc-200 font-medium"
              >
                <option value="all">All Records</option>
                <option value="active">Active Only</option>
                <option value="overstay">Overstay Warnings</option>
                <option value="departed">Departed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
            <thead className="bg-zinc-50 dark:bg-zinc-950/70 border-b border-zinc-200 dark:border-zinc-800 uppercase tracking-wider text-[10px] text-zinc-500 font-bold">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Indian Plate (HSRP)</th>
                <th className="py-3 px-4">FASTag Tag ID</th>
                <th className="py-3 px-4">Stall</th>
                <th className="py-3 px-4">Vehicle Category</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredVehicles.map((v) => {
                const isOverstay = v.status === 'overstay';
                const isDeparted = v.status === 'departed';
                return (
                  <tr
                    key={v.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {v.id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                        {v.plateNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {v.fastagId ? (
                        <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <Radio className="w-2.5 h-2.5" />
                          {v.fastagId}
                        </span>
                      ) : (
                        <span className="text-zinc-400">UPI / QR</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {v.spotId}
                      </span>
                      <span className="text-zinc-400 text-[11px] ml-1">({v.deckId})</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {v.makeModel}
                      </div>
                      <div className="text-[11px] text-zinc-500">{v.vehicleType}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {new Date(v.parkedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      {isDeparted ? (
                        <span className="text-zinc-400 font-mono text-[11px]">DEPARTED</span>
                      ) : isOverstay ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold font-mono text-[11px] inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> OVERSTAY
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[11px] inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {!isDeparted && (
                        <button
                          onClick={() => onOpenPayment(v)}
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded border border-emerald-300 dark:border-emerald-800 transition-colors inline-flex items-center gap-1"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Pay UPI</span>
                        </button>
                      )}

                      <button
                        onClick={() => onOpenPass(v)}
                        className="px-2 py-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 transition-colors inline-flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Pass</span>
                      </button>

                      {!isDeparted && (
                        <button
                          onClick={() => onCheckOutVehicle(v.id)}
                          className="px-2 py-1 text-[11px] font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded border border-rose-200 dark:border-rose-900 transition-colors inline-flex items-center gap-1"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Release</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between">
          <span>Showing {filteredVehicles.length} of {vehicles.length} records</span>
          <span>ApexPark Automated NETC FASTag Clearance System</span>
        </div>
      </div>
    </div>
  );
};
