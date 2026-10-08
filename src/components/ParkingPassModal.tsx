import React from 'react';
import { X, Printer, Copy, Check, MapPin, Clock, Calendar, ShieldCheck, Car } from 'lucide-react';
import { ParkedVehicle, PricingRates } from '../types/parking';
import { QrCodeDisplay, BarcodeDisplay } from '../utils/qr';
import { playAudioFeedback } from '../utils/audio';

interface ParkingPassModalProps {
  vehicle: ParkedVehicle | null;
  isOpen: boolean;
  onClose: () => void;
  pricing: PricingRates;
  soundEnabled: boolean;
  onOpenPayment?: (vehicle: ParkedVehicle) => void;
}

export const ParkingPassModal: React.FC<ParkingPassModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  pricing,
  soundEnabled,
  onOpenPayment,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !vehicle) return null;

  const parkedDate = new Date(vehicle.parkedAt);
  const formattedDate = parkedDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = parkedDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handlePrint = () => {
    playAudioFeedback('click', soundEnabled);
    window.print();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(
      `ApexPark India Pass: ${vehicle.id} | Spot: ${vehicle.spotId} (${vehicle.deckId}) | Plate: ${vehicle.plateNumber}`
    );
    setCopied(true);
    playAudioFeedback('confirm', soundEnabled);
    setTimeout(() => setCopied(false), 2000);
  };

  const is2W = vehicle.vehicleType.includes('2-Wheeler');
  const hourlyRate = is2W ? pricing.hourlyRateBike : pricing.hourlyRateCar;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pass-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl p-6 text-zinc-900 dark:text-zinc-100 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls (Hidden during print) */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 id="pass-modal-title" className="text-sm font-semibold tracking-wide uppercase text-zinc-700 dark:text-zinc-300">
              Official Parking Pass & FASTag Slip
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              className="p-1.5 text-xs font-medium inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 transition-colors"
              title="Print pass"
              aria-label="Print parking pass"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleCopyCode}
              className="p-1.5 text-xs font-medium inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 transition-colors"
              title="Copy details"
              aria-label="Copy parking details"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors ml-1"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Formal Slip Paper Graphic */}
        <div className="mt-4 p-5 bg-white border border-dashed border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 shadow-xs print:border-solid print:p-0">
          {/* Header */}
          <div className="text-center border-b border-zinc-200 pb-3">
            <div className="font-mono text-xs font-bold tracking-widest text-zinc-900 uppercase">
              APEXPARK METRO & TECH PARK
            </div>
            <div className="text-[11px] text-zinc-600 mt-0.5 font-medium">
              CYBER CITY CONCOURSE · 24x7 AUTOMATED FACILITY
            </div>
            <div className="text-[10px] text-zinc-500">
              GSTIN: 27AABCA1234F1Z5 · SAC CODE: 996729 · NPCI FASTag ENABLED
            </div>
          </div>

          {/* Ticket ID & Barcode */}
          <div className="my-3 text-center">
            <BarcodeDisplay value={vehicle.id} />
          </div>

          {/* Bay Assignment Highlight */}
          <div className="bg-zinc-50 border border-zinc-200 rounded p-3 my-3 text-center">
            <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
              Allocated Bay Number
            </div>
            <div className="font-mono text-3xl font-extrabold tracking-tight text-zinc-900 my-0.5">
              {vehicle.spotId}
            </div>
            <div className="text-xs font-semibold text-zinc-700">
              Deck {vehicle.deckId} · {vehicle.landmarkNote || 'Standard Stall'}
            </div>
          </div>

          {/* Indian HSRP License Plate Render */}
          <div className="my-3 flex justify-center">
            <div className="inline-flex items-stretch border-2 border-zinc-900 rounded bg-white overflow-hidden shadow-xs">
              {/* Blue IND strip */}
              <div className="bg-blue-700 text-white px-2 py-1 flex flex-col items-center justify-center text-[8px] font-bold">
                <span className="text-[10px] leading-none">☸</span>
                <span className="tracking-widest">IND</span>
              </div>
              {/* Plate characters */}
              <div className="px-3 py-1 font-mono text-base font-extrabold tracking-widest text-zinc-900 flex items-center">
                {vehicle.plateNumber}
              </div>
            </div>
          </div>

          {/* Key metadata grid */}
          <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-zinc-100">
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">Vehicle Make</span>
              <span className="font-medium text-zinc-800 truncate block">
                {vehicle.makeModel} ({vehicle.color})
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">Vehicle Category</span>
              <span className="font-medium text-zinc-800">{vehicle.vehicleType}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">Check-In Time</span>
              <span className="font-mono text-[11px] text-zinc-800">
                {formattedDate} {formattedTime}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">FASTag ID</span>
              <span className="font-mono text-[10px] text-zinc-800">
                {vehicle.fastagId || 'Not Linked (Pay via UPI)'}
              </span>
            </div>
          </div>

          {/* QR Code and Instructions */}
          <div className="flex items-center justify-between gap-4 pt-3">
            <div className="text-left text-[11px] text-zinc-600 leading-relaxed">
              <p className="font-semibold text-zinc-800">Scan at UPI / Exit Kiosk</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Pay using GPay, PhonePe, Paytm, BHIM, or FASTag at boom barrier.
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">
                Tariff: ₹{hourlyRate}/hr
                {pricing.firstThirtyMinutesFree ? ' (First 30m Free)' : ''}
              </p>
            </div>
            <div className="shrink-0">
              <QrCodeDisplay value={`upi://pay?pa=apexpark@icici&pn=ApexPark%20Metro&am=80&cu=INR&tn=${vehicle.id}`} size={84} />
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-zinc-200 text-center text-[9px] text-zinc-400">
            Helpline: 1800-120-PARK · Security Gate #1 · WhatsApp: +91 98100 00000
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-4 flex items-center justify-between gap-2 no-print">
          {onOpenPayment && vehicle.status !== 'departed' && (
            <button
              onClick={() => {
                onClose();
                onOpenPayment(vehicle);
              }}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white rounded transition-colors shadow-xs"
            >
              Pay via UPI / FASTag
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
