import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCcw, MapPin, Dumbbell, ShieldCheck, Umbrella, Sun } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import type { CourtDto } from '../types';

const SPORT_OPTIONS = ['Fotbal', 'Tenis', 'Baschet', 'Volei'];

export default function SearchPage() {
  const navigate = useNavigate();
  const {
    fetchComplexeSportive,
    fetchTerenuri,
    complexList,
    courts,
    complexesLoading,
    catalogError,
    setSelectedCourt,
    clearBookingFlow,
    user,
  } = useBookingStore();

  const [location, setLocation] = useState('');
  const [activity, setActivity] = useState('');

  useEffect(() => {
    fetchComplexeSportive();
    fetchTerenuri();
  }, [fetchComplexeSportive, fetchTerenuri]);

  const handleSearch = async () => {
    await fetchTerenuri(location || undefined, activity || undefined);
  };

  const handleReset = async () => {
    setLocation('');
    setActivity('');
    await fetchTerenuri();
  };

  const handleChooseCourt = (court: CourtDto) => {
    clearBookingFlow();
    setSelectedCourt(court);
    navigate('/rezervare/interval');
  };

  const discountRate =
    user?.rol === 'STUDENT' ? 0.4 : user?.rol === 'PROFESOR' ? 0.2 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Caută o facilitate sportivă</h1>
          <p className="text-sm text-slate-500 mt-1">
            Filtrează după locație și tip de sport, apoi alege intervalul orar dorit
          </p>
        </div>

        {user && discountRate > 0 && (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Beneficiezi de <strong>{discountRate * 100}% reducere</strong> ({user.rol}) la toate terenurile!
            </span>
          </div>
        )}
      </div>

      {catalogError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-xs font-medium">
          {catalogError}
        </div>
      )}

      {/* Bară de filtrare */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Locație (complex)
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="">Toate locațiile</option>
              {complexList.map((c) => (
                <option key={c.id} value={c.nume}>
                  {c.nume}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Tip sport
          </label>
          <div className="relative">
            <Dumbbell className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="">Toate tipurile de sport</option>
              {SPORT_OPTIONS.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            disabled={complexesLoading}
            className="flex-1 bg-blue-900 hover:bg-blue-950 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            <Search className="w-4 h-4" /> Caută
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" /> Resetează
          </button>
        </div>
      </div>

      {/* Grila de carduri */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">
            {courts.length} teren{courts.length === 1 ? '' : 'uri'} găsite
          </span>
        </div>

        {complexesLoading && (
          <div className="text-center py-10 text-slate-500 text-sm">Se încarcă terenurile...</div>
        )}

        {!complexesLoading && courts.length === 0 && (
          <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
            Nu au fost găsite terenuri pentru criteriile selectate.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courts.map((fac) => {
            const discountedPrice = Math.round(fac.tarifOrarStandard * (1 - discountRate) * 100) / 100;
            return (
              <div
                key={fac.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="h-36 bg-gradient-to-br from-blue-900 to-slate-800 p-4 flex flex-col justify-between text-white relative">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-white/15 backdrop-blur-sm rounded-full text-xs font-semibold">
                      {fac.tipSport}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium">
                      {fac.esteAcoperit ? (
                        <>
                          <Umbrella className="w-3 h-3" /> Acoperit
                        </>
                      ) : (
                        <>
                          <Sun className="w-3 h-3" /> Deschis
                        </>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-lg tracking-wide block">{fac.nume}</span>
                    <span className="text-xs text-blue-200">{fac.complexNume}</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5 text-xs text-slate-500">
                    <p>Durată minimă rezervare: <strong>{fac.durataMinimaOre} oră</strong></p>
                    <p>Program complex: <strong>08:00 – 22:00</strong></p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    {discountRate > 0 ? (
                      <div>
                        <span className="text-xs text-slate-400 line-through mr-2">
                          {fac.tarifOrarStandard} lei / oră
                        </span>
                        <span className="text-sm text-emerald-700 font-bold">
                          ✓ {discountedPrice} lei / oră (-{discountRate * 100}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-emerald-700 font-bold flex items-center gap-1">
                        ✓ {fac.tarifOrarStandard} lei / oră
                      </span>
                    )}

                    <button
                      onClick={() => handleChooseCourt(fac)}
                      className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm rounded-lg transition-colors"
                    >
                      Alege acest teren →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
