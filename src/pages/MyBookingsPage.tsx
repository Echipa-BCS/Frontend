import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CreditCard,
  XCircle,
  Info,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  Dumbbell,
} from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import type { BookingSummaryDto } from '../types';

const RO_MONTHS_SHORT = ['IAN', 'FEB', 'MAR', 'APR', 'MAI', 'IUN', 'IUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const {
    user,
    myBookings,
    myBookingsLoading,
    myBookingsError,
    fetchMyBookings,
    cancelMyBooking,
    resumeReservation,
    clearBookingFlow,
  } = useBookingStore();

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyBookings();
    }
  }, [user, fetchMyBookings]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Autentificare necesară
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Intră în cont pentru a vedea rezervările tale active și istoricul rezervărilor.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-blue-900 dark:bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-950 dark:hover:bg-blue-500 cursor-pointer"
          >
            Mergi la autentificare →
          </button>
        </div>
      </div>
    );
  }

  const now = new Date();

  const isBookingActive = (b: BookingSummaryDto) => {
    const end = new Date(b.dataEnd);
    return (b.stare === 'CONFIRMATA' || b.stare === 'TEMPORAR_BLOCATA') && end >= now;
  };

  const activeBookings = myBookings.filter(isBookingActive);
  const historyBookings = myBookings.filter((b) => !isBookingActive(b));

  const handleCancel = async (id: number) => {
    setCancellingId(id);
    try {
      await cancelMyBooking(id);
      setConfirmCancelId(null);
    } catch {
      // error is set in store
    } finally {
      setCancellingId(null);
    }
  };

  const handleResumePayment = (b: BookingSummaryDto) => {
    resumeReservation(b);
    navigate('/rezervare/plata');
  };

  const getStatusBadge = (b: BookingSummaryDto) => {
    const isPastConfirmed = b.stare === 'CONFIRMATA' && new Date(b.dataEnd) < now;
    if (isPastConfirmed || b.stare === 'FINALIZATA') {
      return {
        label: '✓ Finalizată',
        cls: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      };
    }
    switch (b.stare) {
      case 'CONFIRMATA':
        return {
          label: '✓ Confirmată',
          cls: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        };
      case 'TEMPORAR_BLOCATA':
        return {
          label: '⏱ În așteptarea plății',
          cls: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        };
      case 'ANULATA':
        return {
          label: '✕ Anulată',
          cls: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
        };
      case 'EXPIRATA':
        return {
          label: '⌛ Expirată (neachitată)',
          cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
        };
      default:
        return {
          label: b.stare,
          cls: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        };
    }
  };

  const renderBookingCard = (b: BookingSummaryDto, canModify: boolean) => {
    const start = new Date(b.dataStart);
    const end = new Date(b.dataEnd);
    const monthLabel = RO_MONTHS_SHORT[start.getMonth()] ?? 'LUN';
    const dayNum = String(start.getDate()).padStart(2, '0');
    const badge = getStatusBadge(b);
    const isExpanded = expandedId === b.id;

    return (
      <div
        key={b.id}
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
      >
        <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 ${
                canModify
                  ? 'bg-blue-900 dark:bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="text-[11px] uppercase opacity-75">{monthLabel}</span>
              <span className="text-lg leading-none">{dayNum}</span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {b.complexNume} · {b.terenNume}
                </h3>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs font-medium">
                  {b.tipSport}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {start.toLocaleDateString('ro-RO')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {start.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })} –{' '}
                  {end.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {b.pretTotal} lei
                </span>
              </div>

              <div className="pt-0.5 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-block px-2.5 py-0.5 border rounded text-xs font-semibold ${badge.cls}`}
                >
                  {badge.label}
                </span>
                {b.echipamente && b.echipamente.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 rounded text-xs font-medium">
                    <Dumbbell className="w-3 h-3" /> +{b.echipamente.length} echipament(e)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {b.stare === 'TEMPORAR_BLOCATA' && canModify && (
              <button
                type="button"
                onClick={() => handleResumePayment(b)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" /> Finalizează plata
              </button>
            )}

            {canModify && (
              <>
                {confirmCancelId === b.id ? (
                  <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 px-2.5 py-1 rounded-lg">
                    <span className="text-xs text-red-800 dark:text-red-300 font-semibold">
                      Sigur anulezi?
                    </span>
                    <button
                      type="button"
                      disabled={cancellingId === b.id}
                      onClick={() => handleCancel(b.id)}
                      className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                    >
                      {cancellingId === b.id ? '...' : 'Da'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmCancelId(null)}
                      className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      Nu
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmCancelId(b.id)}
                    className="px-3 py-1.5 border border-red-200 dark:border-red-800/70 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Anulează
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : b.id)}
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              {isExpanded ? 'Ascunde detalii' : 'Detalii'}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">
                Cod complet rezervare
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {b.codRezervare}
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">
                Preț și reducere rol
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Total: {b.pretTotal} lei (Reducere aplicată: {b.discountAplicat} lei)
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">Echipament atașat</span>
              {b.echipamente && b.echipamente.length > 0 ? (
                <ul className="font-semibold text-slate-700 dark:text-slate-200 space-y-0.5">
                  {b.echipamente.map((eq) => (
                    <li key={eq.echipamentId}>
                      • {eq.echipamentDenumire} × {eq.cantitate} ({eq.subtotalPret} lei)
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">
                  Fără echipament suplimentar
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Rezervările mele</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gestionează rezervările active, finalizează plățile în așteptare sau consultă istoricul
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            clearBookingFlow();
            navigate('/cautare');
          }}
          className="px-4 py-2.5 bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 self-start sm:self-auto transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Rezervare nouă
        </button>
      </div>

      {myBookingsError && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{myBookingsError}</span>
        </div>
      )}

      {myBookingsLoading ? (
        <div className="text-center py-12 text-sm text-slate-500 dark:text-slate-400">
          Se încarcă rezervările tale...
        </div>
      ) : (
        <>
          {/* Secțiunea 1: Rezervări active */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Rezervări active și viitoare ({activeBookings.length})
              </h2>
            </div>

            {activeBookings.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Nu ai nicio rezervare activă în acest moment.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    clearBookingFlow();
                    navigate('/cautare');
                  }}
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Caută un teren disponibil →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBookings.map((b) => renderBookingCard(b, true))}
              </div>
            )}
          </div>

          {/* Secțiunea 2: Istoric rezervări */}
          {historyBookings.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                Istoric rezervări & Anulate ({historyBookings.length})
              </h2>
              <div className="space-y-3">
                {historyBookings.map((b) => renderBookingCard(b, false))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
