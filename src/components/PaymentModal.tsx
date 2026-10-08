import React, { useState } from 'react';
import {
  X,
  QrCode,
  Smartphone,
  CreditCard,
  Building,
  CheckCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  Radio,
  FileCheck,
  Copy,
  Check,
} from 'lucide-react';
import { ParkedVehicle, PaymentMethod, PaymentTransaction, PricingRates } from '../types/parking';
import { QrCodeDisplay } from '../utils/qr';
import { playAudioFeedback } from '../utils/audio';

interface PaymentModalProps {
  vehicle: ParkedVehicle | null;
  isOpen: boolean;
  onClose: () => void;
  pricing: PricingRates;
  soundEnabled: boolean;
  onPaymentSuccess: (vehicleId: string, transaction: PaymentTransaction) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  pricing,
  soundEnabled,
  onPaymentSuccess,
}) => {
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('UPI');
  const [upiVpa, setUpiVpa] = useState('user@okhdfcbank');
  const [fastagTag, setFastagTag] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<PaymentTransaction | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  React.useEffect(() => {
    if (vehicle) {
      setFastagTag(vehicle.fastagId || `NETC-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`);
      setCompletedTransaction(null);
      setProcessing(false);
    }
  }, [vehicle]);

  if (!isOpen || !vehicle) return null;

  // Calculate bill in INR
  const start = new Date(vehicle.parkedAt).getTime();
  const diffMs = Math.max(0, Date.now() - start);
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const is2W = vehicle.vehicleType.includes('2-Wheeler');
  const hourlyRate = is2W ? pricing.hourlyRateBike : pricing.hourlyRateCar;

  let baseAmount = 0;
  if (pricing.firstThirtyMinutesFree && totalMinutes <= 30) {
    baseAmount = 0;
  } else {
    const billableHours = Math.max(1, Math.ceil(totalMinutes / 60));
    baseAmount = Math.min(billableHours * hourlyRate, pricing.dailyMaximum);
    if (hours >= vehicle.expectedDurationHours && vehicle.status === 'overstay') {
      const overstayHours = hours - vehicle.expectedDurationHours;
      baseAmount += overstayHours * pricing.overstayHourlyPenalty;
    }
  }

  // GST Calculation (18% GST: 9% CGST + 9% SGST)
  const cgst = Number(((baseAmount * 0.09)).toFixed(2));
  const sgst = Number(((baseAmount * 0.09)).toFixed(2));
  const totalAmount = Math.round(baseAmount + cgst + sgst);

  // Generate UPI payment intent URI
  const upiIntentUri = `upi://pay?pa=apexpark@icici&pn=ApexPark%20Metro%20Parking&am=${totalAmount}&cu=INR&tn=Parking%20Pass%20${vehicle.id}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('apexpark@icici');
    setCopiedUpi(true);
    playAudioFeedback('confirm', soundEnabled);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleProcessPayment = () => {
    setProcessing(true);
    playAudioFeedback('click', soundEnabled);

    setTimeout(() => {
      const txId =
        activeMethod === 'UPI'
          ? `UPI-${Math.floor(100000000000 + Math.random() * 900000000000)}`
          : activeMethod === 'FASTag'
          ? `FTG-${Math.floor(10000000 + Math.random() * 90000000)}`
          : `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

      const transaction: PaymentTransaction = {
        transactionId: txId,
        amount: totalAmount,
        method: activeMethod,
        timestamp: new Date().toISOString(),
        upiVpa: activeMethod === 'UPI' ? upiVpa : undefined,
        fastagTagId: activeMethod === 'FASTag' ? fastagTag : undefined,
        gstBreakdown: {
          baseAmount,
          cgst,
          sgst,
          total: totalAmount,
        },
      };

      setCompletedTransaction(transaction);
      setProcessing(false);
      playAudioFeedback('confirm', soundEnabled);
      onPaymentSuccess(vehicle.id, transaction);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-dialog-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl p-6 text-zinc-900 dark:text-zinc-100 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              ₹
            </div>
            <div>
              <h2 id="payment-dialog-title" className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Indian Payment Gateway · NETC / UPI
              </h2>
              <div className="text-[11px] text-zinc-500">
                ApexPark Automated Exit Clearance & GST Invoice
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            aria-label="Close payment modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Confirmation State */}
        {completedTransaction ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Payment Successful · ₹{completedTransaction.amount}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Ref: <span className="font-mono font-bold">{completedTransaction.transactionId}</span> via {completedTransaction.method}
              </p>
            </div>

            {/* Indian GST Tax Slip */}
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-md p-4 text-left text-xs font-mono space-y-1.5 text-zinc-800 dark:text-zinc-200">
              <div className="text-center font-bold text-[11px] border-b pb-1 border-zinc-200 dark:border-zinc-800">
                GST TAX INVOICE · APEXPARK INDIA PVT LTD
                <div className="text-[10px] text-zinc-500 font-sans">GSTIN: 27AABCA1234F1Z5 · SAC: 996729</div>
              </div>
              <div className="flex justify-between pt-1">
                <span>Vehicle Plate:</span>
                <span className="font-bold">{vehicle.plateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Bay Checked Out:</span>
                <span>{vehicle.spotId} ({vehicle.deckId})</span>
              </div>
              <div className="flex justify-between">
                <span>Base Parking Fee:</span>
                <span>₹{completedTransaction.gstBreakdown.baseAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>CGST (9%):</span>
                <span>₹{completedTransaction.gstBreakdown.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>SGST (9%):</span>
                <span>₹{completedTransaction.gstBreakdown.sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-1 border-zinc-200 dark:border-zinc-800 font-bold text-sm">
                <span>Total Paid:</span>
                <span>₹{completedTransaction.gstBreakdown.total}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>RFID Exit Boom Barrier is OPEN. Safe travels!</span>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-xs uppercase rounded transition-colors"
              >
                Done / Close Receipt
              </button>
            </div>
          </div>
        ) : (
          /* Payment Flow */
          <div className="mt-4 space-y-4">
            {/* Tariff & Vehicle Details */}
            <div className="bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">
                  Vehicle Checkout
                </span>
                <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {vehicle.plateNumber}
                </span>
                <span className="text-xs text-zinc-500 block mt-0.5">
                  Bay {vehicle.spotId} · {vehicle.vehicleType}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">
                  Total Payable (Incl. 18% GST)
                </span>
                <span className="font-mono text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  ₹{totalAmount}
                </span>
              </div>
            </div>

            {/* Indian Payment Method Tabs */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                Select Indian Payment Mode
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs">
                {(['UPI', 'FASTag', 'RuPay Card', 'NetBanking'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setActiveMethod(method);
                      playAudioFeedback('click', soundEnabled);
                    }}
                    className={`py-2 px-1 text-center font-semibold rounded transition-colors ${
                      activeMethod === method
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Method 1: UPI */}
            {activeMethod === 'UPI' && (
              <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="shrink-0 text-center">
                    <QrCodeDisplay value={upiIntentUri} size={110} />
                    <span className="text-[10px] font-mono text-zinc-500 block mt-1">
                      Scan with any UPI App
                    </span>
                  </div>

                  <div className="flex-1 space-y-2 text-left w-full">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      <span>Supported UPI Apps:</span>
                    </div>
                    {/* Clean unboxed tags with typographic separators */}
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                      <span>GPay</span>
                      <span aria-hidden="true" className="mx-1">·</span>
                      <span>PhonePe</span>
                      <span aria-hidden="true" className="mx-1">·</span>
                      <span>Paytm</span>
                      <span aria-hidden="true" className="mx-1">·</span>
                      <span>BHIM</span>
                      <span aria-hidden="true" className="mx-1">·</span>
                      <span>CRED</span>
                    </div>

                    <div className="pt-1">
                      <div className="text-[11px] text-zinc-500 mb-1">Or pay to Facility VPA:</div>
                      <div className="flex items-center gap-1 font-mono text-xs bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded border border-zinc-200 dark:border-zinc-700">
                        <span className="font-bold flex-1 text-zinc-900 dark:text-zinc-100">apexpark@icici</span>
                        <button
                          onClick={handleCopyUpi}
                          className="px-2 py-0.5 text-[10px] font-sans font-semibold bg-zinc-200 dark:bg-zinc-800 rounded hover:bg-zinc-300 transition-colors"
                        >
                          {copiedUpi ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Enter Personal UPI ID (e.g. mobile@upi)
                  </label>
                  <input
                    type="text"
                    value={upiVpa}
                    onChange={(e) => setUpiVpa(e.target.value)}
                    placeholder="e.g. yourname@oksbi"
                    className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Method 2: FASTag Auto-Debit */}
            {activeMethod === 'FASTag' && (
              <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 space-y-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    NETC FASTag Electronic Parking Toll
                  </span>
                </div>

                <p className="text-xs text-zinc-500 leading-relaxed">
                  Automatic contactless debit from your NHAI / NETC FASTag wallet at exit boom gate.
                </p>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Detected FASTag RFID Tag ID
                  </label>
                  <input
                    type="text"
                    value={fastagTag}
                    onChange={(e) => setFastagTag(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-1">
                  <span>Linked Issuer: Paytm Payments Bank / ICICI FASTag</span>
                  <span className="text-emerald-600 font-semibold font-mono">ACTIVE BALANCE: ₹750</span>
                </div>
              </div>
            )}

            {/* Method 3: RuPay Card */}
            {activeMethod === 'RuPay Card' && (
              <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    Debit / Credit Card (RuPay, Visa, MasterCard)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-blue-600">RuPay 2.0</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="6073 1234 5678 9012 (RuPay Card)"
                    className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-xs font-mono text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="08/29"
                      className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-xs font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-xs font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Method 4: Net Banking */}
            {activeMethod === 'NetBanking' && (
              <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 block">
                  Select Indian Bank for NetBanking
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['State Bank of India (SBI)', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Punjab National Bank'].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-2 text-left rounded border transition-colors ${
                        selectedBank === bank
                          ? 'border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800 font-bold'
                          : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between gap-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={processing}
                className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <span>Processing ₹{totalAmount}...</span>
                ) : (
                  <>
                    <span>Pay ₹{totalAmount} via {activeMethod}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
