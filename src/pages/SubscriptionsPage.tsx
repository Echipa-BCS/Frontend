import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, CheckCircle2, Sparkles, Calendar, AlertCircle } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const {
    user,
    subscriptions,
    subscriptionsLoading,
    subscriptionsError,
    fetchSubscriptions,
    buySubscription,
  } = useBookingStore();

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [buyingType, setBuyingType] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user, fetchSubscriptions]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h1 className="text-xl font-bold text-slate-900">Autentificare necesară</h1>
          <p className="text-sm text-slate-500">
            Intră în cont pentru a vedea și gestiona abonamentele tale sportive.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-950"
          >
            Mergi la autentificare →
          </button>
        </div>
      </div>
    );
  }

  const discountRate =
    user.rol === 'STUDENT' ? 0.4 : user.rol === 'PROFESOR' ? 0.2 : 0;

  const plans = [
    {
      tip: 'GENERAL_ACCESS' as const,
      title: 'General Access — 10 Ședințe',
      desc: 'Acces la toate terenurile din complex timp de 30 de zile, oricând în intervalul 08:00 – 22:00.',
      sessions: 10,
      basePrice: 200,
      finalPrice: Math.round(200 * (1 - discountRate)),
    },
    {
      tip: 'INTERVAL_FIX' as const,
      title: 'Interval Fix — 5 Ședințe',
      desc: 'Pachet de 5 ședințe valabil 30 de zile pentru antrenamente săptămânale regulate.',
      sessions: 5,
      basePrice: 120,
      finalPrice: Math.round(120 * (1 - discountRate)),
    },
  ];

  const handleBuy = async (tip: 'GENERAL_ACCESS' | 'INTERVAL_FIX', title: string) => {
    setBuyingType(tip);
    setSuccessMsg(null);
    try {
      await buySubscription(tip);
      setSuccessMsg(`Abonamentul „${title}” a fost activat cu succes!`);
    } catch {
      // error is set in store
    } finally {
      setBuyingType(null);
    }
  };

  const now = new Date();
  const activeSubs = subscriptions.filter(
    (s) => s.activ && s.sedinteRamase > 0 && new Date(s.dataExpirare) > now
  );
  const pastSubs = subscriptions.filter(
    (s) => !(s.activ && s.sedinteRamase > 0 && new Date(s.dataExpirare) > now)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Abonamente</h1>
        <p className="text-sm text-slate-500 mt-1">
          Folosește ședințele din abonamentul activ pentru a confirma rezervări fără plată pe loc
        </p>
      </div>

      {subscriptionsError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{subscriptionsError}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Abonamentele active ale utilizatorului */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-blue-900" />
          Abonamentele tale active ({activeSubs.length})
        </h2>

        {subscriptionsLoading && subscriptions.length === 0 ? (
          <div className="text-sm text-slate-500 py-8 text-center">Se încarcă abonamentele...</div>
        ) : activeSubs.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-sm text-slate-500">
            Nu ai niciun abonament activ în acest moment. Alege unul dintre pachetele de mai jos!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeSubs.map((sub) => {
              const start = new Date(sub.dataStart);
              const exp = new Date(sub.dataExpirare);
              return (
                <div
                  key={sub.id}
                  className="bg-white p-6 rounded-xl border-2 border-emerald-500/40 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                      ● Activ
                    </span>
                    <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full">
                      {sub.sedinteRamase} ședințe rămase
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {sub.tip === 'GENERAL_ACCESS'
                        ? 'General Access — Acces Complet'
                        : 'Interval Fix — Antrenament'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Titular: {user.prenume} {user.nume} ({user.rol})
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Valabilitate: {start.toLocaleDateString('ro-RO')} –{' '}
                      {exp.toLocaleDateString('ro-RO')}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate('/cautare')}
                      className="text-blue-900 font-bold hover:underline"
                    >
                      Rezervă cu acest abonament →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Achiziționare abonament nou */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Activează un abonament nou (simulare plată)
            </h2>
            <p className="text-xs text-slate-500">
              Prețurile includ automat reducerea aferentă rolului tău ({user.rol}: -{discountRate * 100}%)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((p) => (
            <div
              key={p.tip}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-5"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-900 rounded text-xs font-bold">
                    {p.sessions} ședințe incluse
                  </span>
                  <span className="text-xs text-slate-400">Valabil 30 zile</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {discountRate > 0 && (
                    <span className="text-xs text-slate-400 line-through block">
                      {p.basePrice} lei / lună
                    </span>
                  )}
                  <span className="text-xl font-extrabold text-slate-900">
                    {p.finalPrice} lei
                  </span>
                  <span className="text-xs text-slate-500"> / 30 zile</span>
                </div>

                <button
                  type="button"
                  disabled={buyingType !== null}
                  onClick={() => handleBuy(p.tip, p.title)}
                  className="px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {buyingType === p.tip ? 'Se activează...' : 'Activează abonamentul →'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Istoric abonamente */}
      {pastSubs.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-600 uppercase">
            Abonamente epuizate / expirate ({pastSubs.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastSubs.map((sub) => (
              <div
                key={sub.id}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-500"
              >
                <div>
                  <span className="font-bold text-slate-700 block">{sub.tip}</span>
                  <span>
                    Expirare: {new Date(sub.dataExpirare).toLocaleDateString('ro-RO')}
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded font-semibold">
                  {sub.sedinteRamase} ședințe rămase
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
