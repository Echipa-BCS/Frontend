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
            className="text-xs font-semibold text-blue-700 hover:underline mb-1 inline-block"
          >
            ← Înapoi la căutare
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            {activeCourt?.complexNume ?? 'Complexul Sportiv USV Suceava'}
          </h1>
          <p className="text-sm text-slate-500">
            Alege data și intervalul orar liber pe terenul dorit (rezervările în trecut sunt blocate automat)
          </p>
        </div>
        <BookingStepper currentStep={1} />
      </div>

      {(bookingError || localError) && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{localError || bookingError}</span>
        </div>
      )}

      {!user && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center justify-between">
          <span>Trebuie să fii autentificat pentru a bloca un interval orar.</span>
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700"
          >
            Autentificare →
          </button>
        </div>
      )}

      {/* Selector de Dată (7 zile + Calendar) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-blue-900" /> Selectează ziua rezervării
          </span>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium">Altă dată:</label>
            <input
              type="date"
              min={todayIso}
              value={selectedDateIso}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-700"
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
                className={`flex-1 min-w-[95px] py-2.5 px-3 rounded-xl border text-center transition-all ${
                  isActive
                    ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-x-auto space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Orar disponibilitate — {formatFullRoDate(selectedDateIso)}
            </h3>
            <p className="text-xs text-slate-500">
              Click pe o celulă liberă pentru a selecta terenul și ora (durata unei sesiuni: 1 oră)
            </p>
          </div>

          {/* Legendă */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded bg-slate-50 border border-slate-300 inline-block" /> Liber
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded bg-blue-900 inline-block" /> Selectat
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block" /> În curs de rezervare
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded bg-red-100 border border-red-200 inline-block" /> Ocupat
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 inline-block" /> Trecut (indisponibil)
            </span>
          </div>
        </div>

        {slotsLoading ? (
          <div className="py-8 text-center text-sm text-slate-500">
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
                    isSelectedCourt ? 'bg-blue-50/40 border-blue-200' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-40 shrink-0">
                      <div className="text-sm font-bold text-slate-900">{court.nume}</div>
                      <div className="text-[11px] text-slate-500">
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
                                ? 'bg-blue-900 text-white border-blue-900 ring-2 ring-blue-600 shadow-sm'
                                : status === 'occupied'
                                ? 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed opacity-80'
                                : status === 'locked'
                                ? 'bg-amber-100 border-amber-300 text-amber-800 cursor-not-allowed'
                                : status === 'past'
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300'
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
      <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs uppercase font-bold text-slate-400 block">Selecția ta</span>
          {selectedHour !== null ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold text-slate-900">{activeCourt.nume}</span>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 rounded-full text-xs font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatFullRoDate(selectedDateIso)} · {String(selectedHour).padStart(2, '0')}:00 –{' '}
                {String(selectedHour + 1).padStart(2, '0')}:00
              </span>
            </div>
          ) : (
            <span className="text-sm text-amber-700 font-semibold">
              Niciun interval disponibil selectat pentru această zi. Alege altă zi din calendar!
            </span>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Preț estimat teren (1h)</span>
            {discountRate > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-slate-400 line-through">{standardPrice} lei</span>
                <span className="text-xl font-extrabold text-emerald-700">{discountedPrice} lei</span>
              </div>
            ) : (
              <span className="text-xl font-extrabold text-slate-900">{standardPrice} lei</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleBook}
            disabled={bookingLoading || !user || selectedHour === null}
            className="px-6 py-3 bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {bookingLoading ? 'Se blochează slotul...' : 'Blochează slotul →'}
          </button>
        </div>
      </div>
    </div>
  );
}
