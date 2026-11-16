import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BookingStepper from '../components/layout/BookingStepper';
import { useBookingStore } from '../store/bookingStore';
import { CreditCard, ShieldCheck, AlertCircle, Ticket } from 'lucide-react';

export default function BookingPaymentPage() {
  const navigate = useNavigate();
  const {
    confirmPaymentSingleSession,
    confirmPaymentSubscription,
    reservation,
    courtNetPrice,
    selectedCourt,
    selectedCourtName,
    user,
    bookingLoading,
    bookingError,
    paymentType,
    setPaymentType,
    selectedEquipment,
    subscriptions,
    fetchSubscriptions,
    timerSeconds,
    decrementTimer,
  } = useBookingStore();

  const [formData, setFormData] = useState({
    titular: user ? `${user.prenume} ${user.nume}` : 'Alex Popescu',
    card: '4532 1122 3344 5566',
    expiry: '12/28',
    cvv: '123',
  });

  useEffect(() => {
    if (!reservation) {
      navigate('/rezervare/interval');
      return;
    }
    fetchSubscriptions();
  }, [reservation, navigate, fetchSubscriptions]);

  useEffect(() => {
    const timer = setInterval(() => decrementTimer(), 1000);
    return () => clearInterval(timer);
  }, [decrementTimer]);

  if (!reservation) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const equipmentTotal = selectedEquipment.reduce(
    (acc, item) => acc + item.pricePerSession * item.selectedCount,
    0
  );
  const discountedCourtPrice = courtNetPrice > 0 ? courtNetPrice : Math.max(0, reservation.pretTotal - equipmentTotal);
  const total = Math.round((discountedCourtPrice + equipmentTotal) * 100) / 100;

  const activeSubscription = subscriptions.find(
    (s) => s.activ && s.sedinteRamase > 0 && new Date(s.dataExpirare) > new Date()
  );

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reservation) return;

    try {
      if (paymentType === 'individual') {
        await confirmPaymentSingleSession(user.id, reservation.id, total, 'Card');
      } else {
        await confirmPaymentSubscription(user.id, reservation.id);
      }
      navigate('/rezervare/confirmare');
    } catch {
      // error is set in store
    }
  };

  const startDate = new Date(reservation.dataStart);
  const endDate = new Date(reservation.dataEnd);

  const inputCls =
    'w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/rezervare/echipament')}
            className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline mb-1 inline-block cursor-pointer"
          >
            ← Înapoi la echipament
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Finalizează plata</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Alege metoda de plată (card bancar sau abonament activ) și confirmă rezervarea
          </p>
        </div>
        <BookingStepper currentStep={3} />
      </div>

      {bookingError && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{bookingError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form
          onSubmit={handlePay}
          className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors"
        >
          {/* Selector metodă de plată */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-3">
              1. Alege modalitatea de plată
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentType('individual')}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                  paymentType === 'individual'
                    ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-900 dark:border-blue-500 ring-1 ring-blue-900 dark:ring-blue-500'
                    : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-900 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
                    Plată sesiune unică (Card)
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Achită {total} lei acum prin procesatorul simulat
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType('subscription')}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                  paymentType === 'subscription'
                    ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-900 dark:border-blue-500 ring-1 ring-blue-900 dark:ring-blue-500'
                    : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Ticket className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
                    Folosește abonamentul activ
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {activeSubscription
                      ? `${activeSubscription.sedinteRamase} ședințe disponibile`
                      : 'Niciun abonament activ'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {paymentType === 'individual' ? (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                2. Detalii card bancar (simulare)
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nume titular card
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.titular}
                    onChange={handleChange}
                    name="titular"
                    required
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Număr card
                </label>
                <input
                  type="text"
                  value={formData.card}
                  onChange={handleChange}
                  name="card"
                  placeholder="0000 0000 0000 0000"
                  required
                  className={`${inputCls} font-mono`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Data expirării
                  </label>
                  <input
                    type="text"
                    value={formData.expiry}
                    onChange={handleChange}
                    name="expiry"
                    placeholder="LL/AA"
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    value={formData.cvv}
                    onChange={handleChange}
                    name="cvv"
                    placeholder="***"
                    maxLength={4}
                    required
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                2. Verificare abonament
              </h3>
              {activeSubscription ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200 text-sm flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      Abonament {activeSubscription.tip.replace('_', ' ')}
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200 rounded-full text-xs font-bold">
                      {activeSubscription.sedinteRamase} ședințe rămase
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    La confirmare se va deduce <strong>1 ședință</strong> din abonamentul tău activ (cost suplimentar: 0 lei).
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 text-xs text-amber-800 dark:text-amber-300 space-y-2">
                  <p className="font-semibold">
                    Nu ai niciun abonament activ cu ședințe disponibile în acest moment.
                  </p>
                  <p>
                    Poți achita cu cardul bancar sau poți activa un abonament nou din secțiunea{' '}
                    <Link
                      to="/abonamente"
                      className="underline font-bold text-blue-900 dark:text-blue-400"
                    >
                      Abonamente
                    </Link>
                    .
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={
              bookingLoading ||
              !user ||
              timerSeconds === 0 ||
              (paymentType === 'subscription' && !activeSubscription)
            }
            className="w-full py-3 bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-sm rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
          >
            {bookingLoading
              ? 'Se procesează plata...'
              : paymentType === 'individual'
              ? `Plătește ${total} lei și confirmă rezervarea`
              : 'Confirmă folosind 1 ședință din abonament'}
          </button>
        </form>

        {/* Sumar lateral */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 h-fit transition-colors">
          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300 font-semibold flex items-center justify-between">
            <span>⏱ Blocaj activ</span>
            <span className="font-bold text-amber-900 dark:text-amber-200">
              {formatTimer(timerSeconds)}
            </span>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Sumar rezervare</h3>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
              {selectedCourt?.nume || selectedCourtName || `Teren #${reservation.terenId}`}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Cod: #{reservation.codRezervare.slice(0, 10)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {startDate.toLocaleDateString('ro-RO')} ·{' '}
              {startDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })} –{' '}
              {endDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="border-t border-b border-slate-100 dark:border-slate-800 py-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Teren (cu reducere rol)</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {discountedCourtPrice} lei
              </span>
            </div>
            {reservation.discountAplicat > 0 && (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                <span>Economisit prin rol ({user?.rol})</span>
                <span>-{reservation.discountAplicat} lei</span>
              </div>
            )}
            {selectedEquipment
              .filter((e) => e.selectedCount > 0)
              .map((e) => (
                <div key={e.id} className="flex justify-between">
                  <span>
                    {e.name} × {e.selectedCount}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {e.pricePerSession * e.selectedCount} lei
                  </span>
                </div>
              ))}
          </div>

          <div className="flex justify-between items-center font-bold text-slate-900 dark:text-slate-100">
            <span>Total de plată</span>
            <span className="text-2xl font-extrabold">
              {paymentType === 'subscription' && activeSubscription ? '0 lei (Abonament)' : `${total} lei`}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Modalitate:{' '}
            <strong className="text-slate-700 dark:text-slate-200">
              {paymentType === 'individual' ? 'Card bancar' : 'Abonament activ'}
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
}
