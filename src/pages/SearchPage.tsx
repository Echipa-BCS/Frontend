import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCcw, MapPin, Dumbbell } from 'lucide-react';

export default function SearchPage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [activity, setActivity] = useState('');

  const facilities = [
    { id: '1', name: 'Complex Sportiv A', location: 'Locație A - 3 terenuri', sports: ['Tenis', 'Fotbal'], bg: 'bg-emerald-700' },
    { id: '2', name: 'Complex Sportiv B', location: 'Locație B - 2 terenuri', sports: ['Tenis', 'Baschet'], bg: 'bg-blue-900' },
    { id: '3', name: 'Complex Sportiv C', location: 'Locație C - 4 terenuri', sports: ['Volei', 'Fotbal'], bg: 'bg-orange-600' },
    { id: '4', name: 'Complex Sportiv D', location: 'Locație D - 2 terenuri', sports: ['Bazin Înot', 'Fitness'], bg: 'bg-cyan-700' },
    { id: '5', name: 'Complex Sportiv E', location: 'Locație E - 1 teren', sports: ['Handbal'], bg: 'bg-indigo-800' },
    { id: '6', name: 'Complex Sportiv F', location: 'Locație F - 3 terenuri', sports: ['Tenis de masă'], bg: 'bg-teal-700' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Caută o facilitate sportivă</h1>
        <p className="text-sm text-slate-500 mt-1">Filtrează după locație și activitate, apoi alege intervalul orar dorit</p>
      </div>

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
              <option value="">Alege locația</option>
              <option value="locatia-a">Locația A</option>
              <option value="locatia-b">Locația B</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Activitate</label>
          <div className="relative">
            <Dumbbell className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="">Alege activitatea (tenis, fotbal...)</option>
              <option value="tenis">Tenis</option>
              <option value="fotbal">Fotbal</option>
              <option value="baschet">Baschet</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {}}
            className="flex-1 bg-blue-900 hover:bg-blue-950 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Search className="w-4 h-4" /> Caută
          </button>
          <button
            onClick={() => { setLocation(''); setActivity(''); }}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" /> Resetează
          </button>
        </div>
      </div>

      {/* Grila de carduri */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">{facilities.length} facilități găsite</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {facilities.map((fac) => (
            <div key={fac.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className={`h-40 ${fac.bg} p-4 flex items-center justify-center text-white relative`}>
                <div className="w-full h-full border-2 border-white/20 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-lg tracking-wider opacity-90">{fac.name}</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{fac.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{fac.location}</p>
                  <div className="flex gap-2 mt-3">
                    {fac.sports.map((sport) => (
                      <span key={sport} className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                        {sport}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    ✓ Echipament disponibil la închiriere
                  </span>
                  <button
                    onClick={() => navigate('/rezervare/interval')}
                    className="w-full py-2 bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm rounded-lg transition-colors"
                  >
                    Vezi disponibilitatea →
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