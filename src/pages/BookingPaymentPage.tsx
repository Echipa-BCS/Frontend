import { useNavigate } from 'react-router-dom';
import BookingStepper from '../components/layout/BookingStepper';
import { CreditCard, Lock } from 'lucide-react';

export default function BookingPaymentPage() {
  const navigate = useNavigate();

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/rezervare/confirmare');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/rezervare/echipament')} className="text-xs font-semibold text-blue-700 hover:underline mb-1 inline-block">
            ← Înapoi la echipament
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Finalizează plata</h1>
          <p className="text-sm text-slate-500">Verifică datele și confirmă plata pentru a definitiva rezervarea</p>
        </div>
        <BookingStepper currentStep={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handlePay} className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 text-lg border-b pb-3 border-slate-100">Date card</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nume titular</label>
              <input type="text" defaultValue="Ion Popescu" required className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Număr card</label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input type="text" placeholder="0000 0000 0000 0000" required className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Data expirării</label>
                <input type="text" placeholder="LL/AA" required className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">CVV</label>
                <input type="password" placeholder="***" maxLength={3} required className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" /> Plătește 35 lei
          </button>
        </form>

        {/* Resumat lateral */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-slate-900 text-lg">Sumar rezervare</h3>
          <p className="text-sm font-semibold text-slate-800">Teren 2 · Tenis</p>
          <p className="text-xs text-slate-500">Joi, 29 Oct 2026 · 10:00-11:00</p>
          <div className="border-t pt-3 flex justify-between font-bold text-slate-900">
            <span>Total de plată</span>
            <span className="text-xl">35 lei</span>
          </div>
        </div>
      </div>
    </div>
  );
}