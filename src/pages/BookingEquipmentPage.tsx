import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingStepper from '../components/layout/BookingStepper';
import { useBookingStore } from '../store/bookingStore';

export default function BookingEquipmentPage() {
  const navigate = useNavigate();
  const {
    selectedEquipment,
    updateEquipmentCount,
    timerSeconds,
    decrementTimer,
  } = useBookingStore();

  useEffect(() => {
    const timer = setInterval(() => decrementTimer(), 1000);
    return () => clearInterval(timer);
  }, [decrementTimer]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const equipmentTotal = selectedEquipment.reduce((acc, item) => acc + item.pricePerSession * item.selectedCount, 0);
  const basePrice = 60;
  const discount = 35; // Reducere student (50% pe teren)
  const total = basePrice + equipmentTotal - discount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/rezervare/interval')} className="text-xs font-semibold text-blue-700 hover:underline mb-1 inline-block">
            ← Înapoi la orar
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Alege echipamentul</h1>
          <p className="text-sm text-slate-500">Opțional - se închiriază doar pe durata ședinței</p>
        </div>
        <BookingStepper currentStep={2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Grilă Echipamente */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectedEquipment.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                <p className="text-xs text-slate-500">{item.description}</p>
                <div className="mt-2 text-sm font-bold text-blue-900">{item.pricePerSession} lei / ședință</div>
                <div className="text-xs text-slate-400 mt-1">Disponibil: {item.availableCount} din {item.maxPerBooking} max</div>
              </div>
              <div className="flex items-center justify-between border-t pt-3 border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateEquipmentCount(item.id, Math.max(0, item.selectedCount - 1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold text-sm">{item.selectedCount}</span>
                  <button
                    onClick={() => updateEquipmentCount(item.id, Math.min(item.availableCount, item.selectedCount + 1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
                <span className="font-bold text-slate-900 text-sm">{item.pricePerSession * item.selectedCount} lei</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Sumar Rezervare */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 h-fit">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 font-semibold flex items-center justify-between">
            <span>⏱ Interval blocat - expiră în</span>
            <span className="font-bold text-amber-900">{formatTimer(timerSeconds)}</span>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-lg">Sumar rezervare</h3>
            <p className="text-xs text-slate-500 mt-1">Teren 2 · Tenis</p>
            <p className="text-xs text-slate-400">Joi, 29 Oct 2026 · 10:00-11:00</p>
          </div>

          <div className="space-y-2 text-sm border-t border-b border-slate-100 py-3">
            <div className="flex justify-between text-slate-600">
              <span>Închiriere teren</span>
              <span>{basePrice} lei</span>
            </div>
            {equipmentTotal > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Echipament închiriat</span>
                <span>{equipmentTotal} lei</span>
              </div>
            )}
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Reducere Student (50%)</span>
              <span>-{discount} lei</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">Total</span>
            <span className="text-2xl font-extrabold text-slate-900">{total} lei</span>
          </div>

          <button
            onClick={() => navigate('/rezervare/plata')}
            className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm rounded-lg transition-colors"
          >
            Continuă spre plată →
          </button>
        </div>
      </div>
    </div>
  );
}