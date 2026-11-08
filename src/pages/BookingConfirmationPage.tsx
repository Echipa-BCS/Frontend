import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar, Download } from 'lucide-react';

export default function BookingConfirmationPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rezervarea ta a fost înregistrată!</h1>
          <p className="text-sm text-slate-500 mt-1">Am trimis confirmarea pe adresa de email.</p>
          <span className="inline-block mt-3 px-4 py-1 bg-slate-100 font-mono text-sm font-bold text-slate-700 rounded-lg">
            Cod rezervare: #RZ-291026-0217
          </span>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-left grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-slate-400 block">Facilitate</span>
            <span className="font-bold text-slate-800">Complex Sportiv X</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Teren</span>
            <span className="font-bold text-slate-800">Teren 2 · Tenis</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Data & Ora</span>
            <span className="font-bold text-slate-800">Joi, 29 Oct 2026 · 10:00 - 11:00</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Total Plătit</span>
            <span className="font-bold text-slate-800">35 lei</span>
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