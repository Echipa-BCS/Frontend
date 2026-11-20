import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import BookingStepper from '../components/layout/BookingStepper';
import { useBookingStore } from '../store/bookingStore';
import type { CourtDto } from '../types';

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
const RO_DAYS = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
const RO_MONTHS = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function toLocalIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatFullRoDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return `${RO_DAYS[dateObj.getDay()]}, ${d} ${RO_MONTHS[m - 1]} ${y}`;
}

export default function BookingSlotPage() {
  const navigate = useNavigate();
  const {
    courts,
    fetchTerenuri,
    selectedCourt,
    setSelectedCourt,
    occupiedSlots,
    slotsLoading,
    fetchOccupiedSlots,
    selectSlot,
    createTemporaryReservation,
    bookingLoading,
    bookingError,
    clearBookingError,
    user,
  } = useBookingStore();

  const todayIso = useMemo(() => toLocalIsoDate(new Date()), []);
  const [selectedDateIso, setSelectedDateIso] = useState<string>(todayIso);
  const [userSelectedCourtId, setUserSelectedCourtId] = useState<number | null>(
    selectedCourt?.id ?? null
  );
  const [userSelectedHour, setUserSelectedHour] = useState<number | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Build 7-day strip starting from today
  const upcomingDays = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = toLocalIsoDate(d);
      return {
        iso,
        dayName: i === 0 ? 'Azi' : i === 1 ? 'Mâine' : RO_DAYS[d.getDay()],
        shortDate: `${d.getDate()} ${RO_MONTHS[d.getMonth()]}`,
        fullLabel: formatFullRoDate(iso),
      };
    });
  }, []);

  useEffect(() => {
    if (courts.length === 0) {
      fetchTerenuri();
    }
  }, [courts.length, fetchTerenuri]);

  useEffect(() => {
    fetchOccupiedSlots(selectedDateIso);
  }, [selectedDateIso, fetchOccupiedSlots]);

  const displayCourts: CourtDto[] = useMemo(() => {
    if (courts.length > 0) return courts;
    return [
      { id: 1, complexId: 1, complexNume: 'Complexul Sportiv USV Suceava', nume: 'Teren Fotbal', tipSport: 'Fotbal', esteAcoperit: true, tarifOrarStandard: 60, durataMinimaOre: 1 },
      { id: 2, complexId: 1, complexNume: 'Complexul Sportiv USV Suceava', nume: 'Teren Tenis', tipSport: 'Tenis', esteAcoperit: true, tarifOrarStandard: 50, durataMinimaOre: 1 },
      { id: 3, complexId: 1, complexNume: 'Complexul Sportiv USV Suceava', nume: 'Teren Baschet', tipSport: 'Baschet', esteAcoperit: false, tarifOrarStandard: 40, durataMinimaOre: 1 },
      { id: 4, complexId: 1, complexNume: 'Complexul Sportiv USV Suceava', nume: 'Teren Volei', tipSport: 'Volei', esteAcoperit: false, tarifOrarStandard: 35, durataMinimaOre: 1 },
    ];
  }, [courts]);

  const selectedCourtId = useMemo(() => {
    if (userSelectedCourtId !== null && displayCourts.some((c) => c.id === userSelectedCourtId)) {
      return userSelectedCourtId;
    }
    if (selectedCourt && displayCourts.some((c) => c.id === selectedCourt.id)) {
      return selectedCourt.id;
    }
    return displayCourts[0].id;
  }, [userSelectedCourtId, selectedCourt, displayCourts]);

  const isSlotInPast = useCallback((isoDate: string, hour: number): boolean => {
    const now = new Date();
    const [y, m, d] = isoDate.split('-').map(Number);
    const slotStart = new Date(y, m - 1, d, hour, 0, 0);
    return slotStart <= now;
  }, []);

  const getSlotStatus = useCallback(
    (courtId: number, hour: number): 'past' | 'occupied' | 'locked' | 'free' => {
      if (isSlotInPast(selectedDateIso, hour)) {
        return 'past';
      }

      const [y, m, d] = selectedDateIso.split('-').map(Number);
      const slotStartMs = new Date(y, m - 1, d, hour, 0, 0).getTime();
      const slotEndMs = new Date(y, m - 1, d, hour + 1, 0, 0).getTime();

      for (const occ of occupiedSlots) {
        if (occ.terenId !== courtId) continue;
        const occStartMs = new Date(occ.dataStart).getTime();
        const occEndMs = new Date(occ.dataEnd).getTime();
        if (occStartMs < slotEndMs && occEndMs > slotStartMs) {
          return occ.stare === 'CONFIRMATA' ? 'occupied' : 'locked';
        }
      }

      return 'free';
    },
    [selectedDateIso, occupiedSlots, isSlotInPast]
  );

  const selectedHour = useMemo(() => {
    if (userSelectedHour !== null && getSlotStatus(selectedCourtId, userSelectedHour) === 'free') {
      return userSelectedHour;
    }
    return HOURS.find((h) => getSlotStatus(selectedCourtId, h) === 'free') ?? null;
  }, [userSelectedHour, selectedCourtId, getSlotStatus]);

  const activeCourt =
    displayCourts.find((c) => c.id === selectedCourtId) ?? displayCourts[0];

  const discountRate =
    user?.rol === 'STUDENT' ? 0.4 : user?.rol === 'PROFESOR' ? 0.2 : 0;
  const standardPrice = activeCourt?.tarifOrarStandard ?? 60;
  const discountedPrice = Math.round(standardPrice * (1 - discountRate) * 100) / 100;

  const handleDateChange = (newIso: string) => {
    if (newIso < todayIso) {
      setLocalError('Nu puteți selecta o dată din trecut.');
      return;
    }
    setLocalError(null);
    clearBookingError();
    setSelectedDateIso(newIso);
  };

  const handleSlotClick = (court: CourtDto, hour: number) => {
    const status = getSlotStatus(court.id, hour);
    if (status !== 'free') return;
    setLocalError(null);
    clearBookingError();
    setUserSelectedCourtId(court.id);
    setSelectedCourt(court);
    setUserSelectedHour(hour);
  };

  const handleBook = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    if (selectedHour === null) {
      setLocalError('Vă rugăm să alegeți un interval orar disponibil.');
      return;
    }

    if (isSlotInPast(selectedDateIso, selectedHour)) {
      setLocalError('Acest interval orar a trecut deja. Vă rugăm să alegeți o oră viitoare.');
      return;
    }

    const startStr = `${String(selectedHour).padStart(2, '0')}:00`;
    const endStr = `${String(selectedHour + 1).padStart(2, '0')}:00`;
    const dataStart = `${selectedDateIso}T${startStr}:00`;
    const dataEnd = `${selectedDateIso}T${endStr}:00`;

    selectSlot(
      activeCourt.complexNume,
      activeCourt.nume,
      formatFullRoDate(selectedDateIso),
      `${startStr} - ${endStr}`,
      discountedPrice
    );
    setSelectedCourt(activeCourt);

    try {
      await createTemporaryReservation(user.id, activeCourt.id, dataStart, dataEnd);
      navigate('/rezervare/echipament');
    } catch {
      fetchOccupiedSlots(selectedDateIso);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/cautare')}
            className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline mb-1 inline-block cursor-pointer"
          >
            ← Înapoi la căutare
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {activeCourt?.complexNume ?? 'Complexul Sportiv USV Suceava'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Alege data și intervalul orar liber pe terenul dorit (rezervările în trecut sunt blocate automat)
          </p>
        </div>
        <BookingStepper currentStep={1} />
      </div>

      {(bookingError || localError) && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{localError || bookingError}</span>
        </div>
      )}

      {!user && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center justify-between">
          <span>Trebuie să fii autentificat pentru a bloca un interval orar.</span>
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 cursor-pointer"
          >
            Autentificare →
          </button>
        </div>
      )}

      {/* Selector de Dată (7 zile + Calendar) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-blue-900 dark:text-blue-400" /> Selectează ziua rezervării
          </span>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Altă dată:</label>
            <input
              type="date"
              min={todayIso}
              value={selectedDateIso}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 font-semibold text-slate-700 dark:text-slate-200"
            />
          </div>
        </div>

        <div className="flex items-center justify-between overflow-x-auto gap-2 pb-1">
          {upcomingDays.map((d) => {
            const isActive = d.iso === selectedDateIso;
            return (
              <button
                key={d.iso}
                type="button"
                onClick={() => handleDateChange(d.iso)}
                className={`flex-1 min-w-[95px] py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-900 dark:bg-blue-600 text-white border-blue-900 dark:border-blue-500 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span className="block text-xs opacity-80">{d.dayName}</span>
                <span className="block text-sm font-bold">{d.shortDate}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid disponibilitate */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto space-y-5 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Orar disponibilitate — {formatFullRoDate(selectedDateIso)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click pe o celulă liberă pentru a selecta terenul și ora (durata unei sesiuni: 1 oră)
            </p>
          </div>

          {/* Legendă */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 inline-block" /> Liber
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded bg-blue-900 dark:bg-blue-600 inline-block" /> Selectat
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 inline-block" /> În curs de rezervare
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-800 inline-block" /> Ocupat
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
              <span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 inline-block" /> Trecut (indisponibil)
            </span>
          </div>
        </div>

        {slotsLoading ? (
          <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Se verifică disponibilitatea terenurilor...
          </div>
        ) : (
          <div className="space-y-4 min-w-[900px]">
            {displayCourts.map((court) => {
              const isSelectedCourt = court.id === selectedCourtId;
              return (
                <div
                  key={court.id}
                  className={`p-3 rounded-xl border transition-colors ${
                    isSelectedCourt
                      ? 'bg-blue-50/40 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                      : 'border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-40 shrink-0">
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {court.nume}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {court.tipSport} · {court.tarifOrarStandard} lei/h
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-7 lg:grid-cols-14 gap-1.5">
                      {HOURS.map((hour) => {
                        const status = getSlotStatus(court.id, hour);
                        const isSelected =
                          court.id === selectedCourtId && selectedHour === hour && status === 'free';
                        const timeLabel = `${String(hour).padStart(2, '0')}:00`;

                        return (
                          <button
                            key={hour}
                            type="button"
                            disabled={status !== 'free'}
                            onClick={() => handleSlotClick(court, hour)}
                            title={`${court.nume} · ${timeLabel} - ${String(hour + 1).padStart(2, '0')}:00`}
                            className={`h-11 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-blue-900 dark:bg-blue-600 text-white border-blue-900 dark:border-blue-500 ring-2 ring-blue-600 dark:ring-blue-400 shadow-sm cursor-pointer'
                                : status === 'occupied'
                                ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800/70 text-red-700 dark:text-red-300 cursor-not-allowed opacity-85'
                                : status === 'locked'
                                ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 cursor-not-allowed'
                                : status === 'past'
                                ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed line-through'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer'
                            }`}
                          >
                            {isSelected ? (
                              <span>✓ {timeLabel}</span>
                            ) : status === 'occupied' ? (
                              <span className="text-[10px]">Ocupat</span>
                            ) : status === 'locked' ? (
                              <span className="text-[10px]">⏱ Blocat</span>
                            ) : (
                              <span>{timeLabel}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bară inferioară confirmare selecție */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 block">
            Selecția ta
          </span>
          {selectedHour !== null ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {activeCourt.nume}
              </span>
              <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 rounded-full text-xs font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatFullRoDate(selectedDateIso)} · {String(selectedHour).padStart(2, '0')}:00 –{' '}
                {String(selectedHour + 1).padStart(2, '0')}:00
              </span>
            </div>
          ) : (
            <span className="text-sm text-amber-700 dark:text-amber-400 font-semibold">
              Niciun interval disponibil selectat pentru această zi. Alege altă zi din calendar!
            </span>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">
              Preț estimat teren (1h)
            </span>
            {discountRate > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                  {standardPrice} lei
                </span>
                <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                  {discountedPrice} lei
                </span>
              </div>
            ) : (
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {standardPrice} lei
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleBook}
            disabled={bookingLoading || !user || selectedHour === null}
            className="px-6 py-3 bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {bookingLoading ? 'Se blochează slotul...' : 'Blochează slotul →'}
          </button>
        </div>
      </div>
    </div>
  );
}
