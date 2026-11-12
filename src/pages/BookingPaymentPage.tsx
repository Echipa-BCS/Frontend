import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingStepper from '../components/layout/BookingStepper';
import { useBookingStore } from '../store/bookingStore';
import { CreditCard, Lock } from 'lucide-react';
import type { User } from '../types';

export default function BookingPaymentPage() {
  const navigate = useNavigate();
  const {
    confirmPaymentSingleSession,
    confirmPaymentSubscription,
    reservation,
    user,
    bookingLoading,
    paymentType,
    setPaymentType,
    selectedEquipment,
  } = useBookingStore();

  const loggedInUser = user;
  const [formData, setFormData] = useState({
    titular: 'Ion Popescu',
    card: '',
    expiry: '',
    cvv: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const basePrice = reservation?.pretTotal ?? 35;
  const total = basePrice;

  const equipmentTotal = selectedEquipment.reduce((acc, item) => acc + item.pricePerSession * item.selectedCount, 0);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInUser || !reservation) return;

    try {
      if (paymentType === 'individual') {
        await confirmPaymentSingleSession(
          loggedInUser.id,
          reservation.id,
          total + equipmentTotal,
          'Card'
        );
      } else {
        await confirmPaymentSubscription(loggedInUser.id, reservation.id);
      }
      navigate('/rezervare/confirmare');
    } catch {
      // error already set in store
    }
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

      {bookingLoading && (
        <div className="text-center py-10 text-slate-500 text-sm">Procesez plata...</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handlePay} className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 text-lg border-b pb-3 border-slate-100">Date card</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nume titular</label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.titular}
                  onChange={handleChange}
                  name="titular"
                  required
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Număr card</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.card}
                  onChange={handleChange}
                  name="card"
                  placeholder="0000 0000 0000 0000"
                  required
                  className="w-full pl-3 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Data expirării</label>
                <input
                  type="text"
                  value={formData.expiry}
                  onChange={handleChange}
                  name="expiry"
                  placeholder="LL/AA"
                  required
                  className="w-full pl-3 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">CVV</label>
                <input
                  type="password"
                  value={formData.cvv}
                  onChange={handleChange}
                  name="cvv"
                  placeholder="***"
                  maxLength={3}
                  required
                  className="w-full pl-3 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700">
              <p>Mod de plată: <strong>{paymentType === 'individual' ? 'Sesie unică (card)' : 'Abonament activ'}</strong></p>
              <p>Suma de plata: <strong>{total} lei</strong></p>
              {equipmentTotal > 0 && <p>Echipament: <strong>+{equipmentTotal} lei</strong></p>}
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setPaymentType('individual')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  paymentType === 'individual'
                    ? 'bg-blue-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Sesie unică
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('subscription')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  paymentType === 'subscription'
                    ? 'bg-blue-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Abonament
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={bookingLoading || !loggedInUser}
            className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm rounded-lg transition-colors disabled:opacity-60"
          >
            {bookingLoading ? 'Procesez plata...' : `Plătește ${total} lei`}
          </button>
        </form>

        {/* Resumat lateral */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-slate-900 text-lg">Sumar rezervare</h3>
          <p className="text-sm font-semibold text-slate-800">{reservation?.codRezervare ? 'Rezervare #' + reservation.codRezervare.slice(0, 8) : 'Teren Fotbal'}</p>
          <p className="text-xs text-slate-500">{new Date(reservation?.dataStart ?? '').toLocaleDateString('ro-RO')} · {new Date(reservation?.dataStart ?? '').toLocaleTimeString('ro-RO', {hour: '2-digit', minute:'2-digit'})}</p>
          <div className="border-t pt-3 flex justify-between font-bold text-slate-900">
            <span>Total de plată</span>
            <span className="text-xl">{total} lei</span>
          </div>
          <p className="text-xs text-slate-500">Modalitate: {paymentType === 'individual' ? 'Card bancar' : 'Abonament activ'}</p>
        </div>
      </div>
    </div>
  );
}
