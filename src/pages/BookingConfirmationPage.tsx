import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar, Download } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';

export default function BookingConfirmationPage() {
  const navigate = useNavigate();
  const { reservation, user } = useBookingStore();

  if (!reservation) {
    navigate('/rezervare/plata');
    return null;
  }

  const start = new Date(reservation.dataStart);
  const end = new Date(reservation.dataEnd);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rezervarea ta a fost confirmată!</h1>
          <p className="text-sm text-slate-500 mt-1">Detaliile au fost trimise pe adresa de email.</p>
          <span className="inline-block mt-3 px-4 py-1 bg-slate-100 font-mono text-sm font-bold text-slate-700 rounded-lg">
            Cod rezervare: {reservation.codRezervare}
          </span>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-left grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-slate-400 block">Utilizator</span>
            <span className="font-bold text-slate-800">{user ? user.prenume + ' ' + user.nume : 'N/A'}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Teren</span>
            <span className="font-bold text-slate-800">Teren ID {reservation.terenId}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Data & Ora</span>
            <span className="font-bold text-slate-800">
              {start.toLocaleDateString('ro-RO')} · {start.toLocaleTimeString('ro-RO', {hour: '2-digit', minute: '2-digit'})} - {end.toLocaleTimeString('ro-RO', {hour: '2-digit', minute: '2-digit'})}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Total Plătit</span>
            <span className="font-bold text-slate-800">{reservation.pretTotal} lei</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Reducere</span>
            <span className="font-bold text-slate-800">{reservation.discountAplicat} lei</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Status</span>
            <span className="font-bold text-slate-800">{reservation.stare}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={() => navigate('/rezervarile-mele')}
            className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm rounded-lg transition-colors"
          >
            Vezi rezervările mele →
          </button>
          <button className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-lg flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" /> Adaugă în calendar
          </button>
          <button className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-lg flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Descarcă chitanța
          </button>
        </div>
      </div>
    </div>
  );
}
