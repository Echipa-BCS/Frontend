import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar, Download, PlusCircle } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';

export default function BookingConfirmationPage() {
  const navigate = useNavigate();
  const {
    reservation,
    paymentResult,
    selectedCourt,
    selectedCourtName,
    selectedEquipment,
    user,
    clearBookingFlow,
  } = useBookingStore();

  useEffect(() => {
    if (!reservation) {
      navigate('/cautare');
    }
  }, [reservation, navigate]);

  if (!reservation) {
    return null;
  }

  const start = new Date(reservation.dataStart);
  const end = new Date(reservation.dataEnd);
  const courtDisplay = selectedCourt?.nume || selectedCourtName || `Teren #${reservation.terenId}`;
  const rentedItems = selectedEquipment.filter((e) => e.selectedCount > 0);

  const handleDownloadReceipt = () => {
    const lines = [
      '===========================================',
      '       SPORTUNIVERZ - CHITANȚĂ REZERVARE   ',
      '===========================================',
      `Cod Rezervare: ${reservation.codRezervare}`,
      `Status: ${reservation.stare}`,
      `Utilizator: ${user ? `${user.prenume} ${user.nume} (${user.email})` : 'N/A'}`,
      `Teren: ${courtDisplay}`,
      `Data: ${start.toLocaleDateString('ro-RO')}`,
      `Interval: ${start.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`,
      ...(rentedItems.length > 0
        ? [
            'Echipament închiriat:',
            ...rentedItems.map(
              (i) => `  - ${i.name} x${i.selectedCount}: ${i.pricePerSession * i.selectedCount} lei`
            ),
          ]
        : []),
      `Reducere aplicată: ${reservation.discountAplicat} lei`,
      `Total achitat: ${paymentResult?.suma ?? reservation.pretTotal} lei`,
      ...(paymentResult?.stripeSessionId ? [`ID Tranzacție: ${paymentResult.stripeSessionId}`] : []),
      '===========================================',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chitanta-${reservation.codRezervare.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddToCalendar = () => {
    const formatIcsDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:Rezervare ${courtDisplay} - SportUniverz`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `DESCRIPTION:Cod rezervare: ${reservation.codRezervare}`,
      'LOCATION:Complexul Sportiv USV Suceava',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rezervare-${reservation.codRezervare.slice(0, 8)}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rezervarea ta a fost confirmată!</h1>
          <p className="text-sm text-slate-500 mt-1">
            Plata a fost înregistrată cu succes. Te așteptăm la teren!
          </p>
          <span className="inline-block mt-3 px-4 py-1 bg-slate-100 font-mono text-sm font-bold text-slate-700 rounded-lg">
            Cod rezervare: {reservation.codRezervare}
          </span>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-slate-400 block">Utilizator</span>
            <span className="font-bold text-slate-800">
              {user ? `${user.prenume} ${user.nume}` : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Teren</span>
            <span className="font-bold text-slate-800">{courtDisplay}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Data & Ora</span>
            <span className="font-bold text-slate-800">
              {start.toLocaleDateString('ro-RO')} ·{' '}
              {start.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })} –{' '}
              {end.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Total Achitat</span>
            <span className="font-bold text-slate-800">
              {paymentResult && paymentResult.sedinteRamase !== null && paymentResult.sedinteRamase !== undefined
                ? `0 lei (Abonament · ${paymentResult.sedinteRamase} ședințe rămase)`
                : `${paymentResult?.suma ?? reservation.pretTotal} lei`}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Reducere aplicată</span>
            <span className="font-bold text-emerald-700">{reservation.discountAplicat} lei</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Status</span>
            <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs font-bold">
              {reservation.stare}
            </span>
          </div>
          {rentedItems.length > 0 && (
            <div className="sm:col-span-2 pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-400 block mb-1">Echipament închiriat</span>
              <div className="flex flex-wrap gap-2">
                {rentedItems.map((item) => (
                  <span
                    key={item.id}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                  >
                    {item.name} × {item.selectedCount} ({item.pricePerSession * item.selectedCount} lei)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={() => {
              clearBookingFlow();
              navigate('/rezervarile-mele');
            }}
            className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm rounded-lg transition-colors"
          >
            Vezi rezervările mele →
          </button>
          <button
            type="button"
            onClick={() => {
              clearBookingFlow();
              navigate('/cautare');
            }}
            className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-lg flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Rezervă alt teren
          </button>
          <button
            type="button"
            onClick={handleAddToCalendar}
            className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-lg flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" /> Calendar (.ics)
          </button>
          <button
            type="button"
            onClick={handleDownloadReceipt}
            className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-lg flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Chitanță
          </button>
        </div>
      </div>
    </div>
  );
}
