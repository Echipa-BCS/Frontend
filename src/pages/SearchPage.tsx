import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCcw, MapPin, Dumbbell } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import type { CourtDto } from '../types';

export default function SearchPage() {
  const navigate = useNavigate();
  const { fetchComplexeSportive, fetchTerenuri, complexes, complexesLoading, catalogError } =
    useBookingStore();
  const [location, setLocation] = useState('');
  const [activity, setActivity] = useState('');

  useEffect(() => {
    fetchComplexeSportive();
  }, [fetchComplexeSportive]);

  const handleSearch = async () => {
    await fetchTerenuri(location || undefined, activity || undefined);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Caută o facilitate sportivă</h1>
        <p className="text-sm text-slate-500 mt-1">
          Filtrează după locație și tip de sport, apoi alege intervalul orar dorit
        </p>
      </div>

      {catalogError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-xs font-medium">
          {catalogError}
        </div>
      )}

      {/* Bară de filtrare */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Locație (complex)</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="">Toate locațiile</option>
              {complexes.map((c) => (
                <option key={c.id} value={c.complexNume}>
                  {c.complexNume}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tip sport</label>
          <div className="relative">
            <Dumbbell className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="">Toate tipurile de sport</option>
              {[...new Set(complexes.map((c) => c.tipSport))].map((sport) => (
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
            onClick={() => { setLocation(''); setActivity(''); fetchComplexeSportive(); }}
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
            {complexes.length} teren{complexes.length === 1 ? '' : 'uri'} găsite
          </span>
        </div>

        {complexesLoading && (
          <div className="text-center py-10 text-slate-500 text-sm">Încărcare...</div>
        )}

        {!complexesLoading && complexes.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-sm">
            Nu au fost găsite terenuri pentru criteriile selectate.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {complexes.map((fac) => (
            <div key={fac.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="h-40 bg-slate-100 p-4 flex items-center justify-center text-slate-600 relative">
                <div className="w-full h-full border-2 border-slate-300/20 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-lg tracking-wider opacity-90">{fac.complexNume}</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{fac.nume}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{fac.complexNume}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                      {fac.tipSport}
                    </span>
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                      {fac.esteAcoperit ? 'Acoperit' : 'Deschis'}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    ✓ {fac.tarifOrarStandard} lei / oră
                  </span>
                  <button
                    onClick={() => {
                      navigate('/rezervare/interval');
                      // Pre-select the court in the store
                    }}
                    className="w-full py-2 bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm rounded-lg transition-colors"
                  >
                    Alege acest teren →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
