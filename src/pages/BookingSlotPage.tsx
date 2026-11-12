import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingStepper from '../components/layout/BookingStepper';
import { useBookingStore } from '../store/bookingStore';
import type { User } from '../types';

export default function BookingSlotPage() {
  const navigate = useNavigate();
  const {
    selectSlot,
    createTemporaryReservation,
    reservation,
    bookingLoading,
    bookingError,
    timerSeconds,
    selectedEquipment,
    user,
  } = useBookingStore();
  const [selectedDay, setSelectedDay] = useState('Joi, 29 Oct 2026');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>('t2-10');

  const loggedInUser = user;

  useEffect(() => {
    if (reservation) {
      navigate('/rezervare/echipament');
    }
  }, [reservation, navigate]);

  const days = [
    { day: 'Dum', date: '25 Oct' },
    { day: 'Lun', date: '26 Oct' },
    { day: 'Mar', date: '27 Oct' },
    { day: 'Mie', date: '28 Oct' },
    { day: 'Joi', date: '29 Oct', full: 'Joi, 29 Oct 2026', active: true },
    { day: 'Vin', date: '30 Oct' },
    { day: 'Sâm', date: '31 Oct' },
  ];

  const now = new Date();
  const dataStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T14:00:00`;
  const dataEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T15:00:00`;

  const handleBook = async () => {
    if (!loggedInUser) {
      navigate('/');
      return;
    }
    try {
      await createTemporaryReservation(
        loggedInUser.id,
        1, // terenId - default to football court (id 1 from seeder)
        dataStart,
        dataEnd
      );
    } catch {
      // error already set in store
    }
  };

  const handleNext = () => {
    selectSlot('Complexul Sportiv USV Suceava', 'Teren Fotbal', selectedDay, '14:00 - 15:00', 60);
    handleBook();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/')} className="text-xs font-semibold text-blue-700 hover:underline mb-1 inline-block">
            ← Înapoi la căutare
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Complexul Sportiv USV Suceava</h1>
          <p className="text-sm text-slate-500">Alege data și intervalul orar liber pe terenul dorit</p>
        </div>
        <BookingStepper currentStep={1} />
      </div>

      {bookingError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-xs font-medium">
          {bookingError}
        </div>
      )}

      {/* Data Picker */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between overflow-x-auto gap-2">
        {days.map((d) => (
          <button
            key={d.date}
            onClick={() => setSelectedDay(d.full || d.date)}
            className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl border text-center transition-all ${
              d.active
                ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="block text-xs opacity-80">{d.day}</span>
            <span className="block text-sm font-bold">{d.date}</span>
          </button>
        ))}
      </div>

      {/* Grid disponibilitate */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-x-auto space-y-4">
        <h3 className="font-bold text-slate-800 text-sm">{selectedDay}</h3>

        <div className="space-y-4 min-w-[700px]">
          {['Teren Fotbal', 'Teren Tenis', 'Teren Baschet', 'Teren Volei'].map((court, cIdx) => (
            <div key={court} className="flex items-center gap-4">
              <div className="w-32 text-sm font-bold text-slate-800">{court}</div>
              <div className="flex-1 grid grid-cols-6 gap-2">
                {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'].map((time, tIdx) => {
                  const isSelected = selectedSlotId === `${cIdx}-${tIdx}`;
                  const isProcessing = cIdx === 0 && tIdx === 4;

                  return (
                    <button
                      key={time}
                      onClick={() => setSelectedSlotId(`${cIdx}-${tIdx}`)}
                      className={`h-12 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-blue-900 text-white border-blue-900 ring-2 ring-blue-600'
                          : isProcessing
                            ? 'bg-amber-100 border-amber-300 text-amber-800'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-50'
                      }`}
                    >
                      {isSelected ? '✓ Selectat' : isProcessing ? '⏱ În curs' : time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bară inferioară confirmare selecție */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-slate-400 block">Selecția ta</span>
          <span className="text-lg font-bold text-slate-900">Teren Fotbal</span>
          <span className="text-xs text-slate-500 ml-2">{selectedDay} · 14:00-15:00</span>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-slate-500 block">Preț teren</span>
            <span className="text-xl font-extrabold text-slate-900">60 lei</span>
          </div>
          <button
            onClick={handleNext}
            disabled={bookingLoading || !loggedInUser}
            className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-60"
          >
            {bookingLoading ? 'Blochează slotul...' : 'Blochează slotul →'}
          </button>
        </div>
      </div>

      {/* Timer display */}
      {timerSeconds > 0 && (
        <div className="text-center py-2 text-xs text-amber-700 font-medium">
          Interval blocat - expiră în {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
        </div>
      )}
    </div>
  );
}
