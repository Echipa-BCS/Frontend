import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingStepper from '../components/layout/BookingStepper';
import { useBookingStore } from '../store/bookingStore';
import { AlertCircle, Dumbbell } from 'lucide-react';

export default function BookingEquipmentPage() {
  const navigate = useNavigate();
  const {
    selectedEquipment,
    updateEquipmentCount,
    fetchEquipment,
    syncEquipmentToReservation,
    timerSeconds,
    decrementTimer,
    reservation,
    courtNetPrice,
    selectedCourt,
    selectedCourtName,
    bookingLoading,
    bookingError,
  } = useBookingStore();

  useEffect(() => {
    if (!reservation) {
      navigate('/rezervare/interval');
      return;
    }
    fetchEquipment(selectedCourt?.complexId);
  }, [reservation, selectedCourt?.complexId, fetchEquipment, navigate]);

  useEffect(() => {
    const timer = setInterval(() => decrementTimer(), 1000);
    return () => clearInterval(timer);
  }, [decrementTimer]);

  if (!reservation) {
    return null;
  }

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const equipmentTotal = selectedEquipment.reduce(
    (acc, item) => acc + item.pricePerSession * item.selectedCount,
    0
  );

  // reservation.pretTotal from ReserveTemporarily already has discountAplicat subtracted
  const discountedCourtPrice = courtNetPrice > 0 ? courtNetPrice : reservation.pretTotal;
  const discount = reservation.discountAplicat ?? 0;
  const standardCourtPrice = Math.round((discountedCourtPrice + discount) * 100) / 100;
  const total = Math.round((discountedCourtPrice + equipmentTotal) * 100) / 100;

  const handleNext = async () => {
    try {
      await syncEquipmentToReservation();
      navigate('/rezervare/plata');
    } catch {
      // error is displayed via bookingError
    }
  };

  const startDate = new Date(reservation.dataStart);
  const endDate = new Date(reservation.dataEnd);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/rezervare/interval')}
            className="text-xs font-semibold text-blue-700 hover:underline mb-1 inline-block"
          >
            ← Înapoi la alegerea intervalului
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Alege echipamentul sportiv</h1>
          <p className="text-sm text-slate-500">
            Opțional — echipamentul selectat se atașează rezervării tale și se închiriază pe durata ședinței
          </p>
        </div>
        <BookingStepper currentStep={2} />
      </div>

      {bookingError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{bookingError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Grilă Echipamente */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectedEquipment.map((item) => {
            const isSelected = item.selectedCount > 0;
            return (
              <div
                key={item.id}
                className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                  isSelected ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-semibold flex items-center gap-1">
                      <Dumbbell className="w-3 h-3" /> {item.sportType}
                    </span>
                    <span className="text-xs text-slate-400">
                      Stoc disponibil: <strong>{item.availableCount}</strong>
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mt-2">{item.name}</h3>
                  <p className="text-xs text-slate-500">Se închiriază pe durata ședinței</p>
                  <div className="mt-2 text-sm font-bold text-blue-900">
                    {item.pricePerSession} lei / oră
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-3 border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateEquipmentCount(item.id, Math.max(0, item.selectedCount - 1))
                      }
                      disabled={item.selectedCount === 0}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-sm">{item.selectedCount}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateEquipmentCount(
                          item.id,
                          Math.min(item.availableCount, item.maxPerBooking, item.selectedCount + 1)
                        )
                      }
                      disabled={item.selectedCount >= item.availableCount}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">
                    {item.pricePerSession * item.selectedCount} lei
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Sumar Rezervare */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 h-fit">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 font-semibold flex items-center justify-between">
            <span>⏱ Interval blocat temporar</span>
            <span className="font-bold text-amber-900">{formatTimer(timerSeconds)}</span>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-lg">Sumar rezervare</h3>
            <p className="text-xs font-semibold text-slate-700 mt-1">
              {selectedCourt?.nume || selectedCourtName || `Teren #${reservation.terenId}`}
            </p>
            <p className="text-xs text-slate-500">
              Cod: <span className="font-mono">{reservation.codRezervare.slice(0, 10)}</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {startDate.toLocaleDateString('ro-RO')} ·{' '}
              {startDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })} –{' '}
              {endDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="space-y-2 text-sm border-t border-b border-slate-100 py-3">
            <div className="flex justify-between text-slate-600">
              <span>Tarif standard teren</span>
              <span>{standardCourtPrice} lei</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Reducere rol aplicată</span>
                <span>-{discount} lei</span>
              </div>
            )}
            <div className="flex justify-between text-slate-800 font-medium">
              <span>Subtotal teren</span>
              <span>{discountedCourtPrice} lei</span>
            </div>
            {equipmentTotal > 0 && (
              <div className="flex justify-between text-blue-900 font-medium pt-1 border-t border-slate-100">
                <span>Echipament selectat</span>
                <span>+{equipmentTotal} lei</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">Total de plată</span>
            <span className="text-2xl font-extrabold text-slate-900">{total} lei</span>
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={bookingLoading || timerSeconds === 0}
            className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm rounded-lg transition-colors disabled:opacity-60"
          >
            {bookingLoading ? 'Se salvează echipamentul...' : 'Continuă spre plată →'}
          </button>
        </div>
      </div>
    </div>
  );
}
