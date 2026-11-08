import { useState } from 'react';
import { Check, ShieldCheck, Globe, Camera, KeyRound } from 'lucide-react';

export default function ProfilePage() {
  const [language, setLanguage] = useState<'ro' | 'en'>('ro');
  const [privilege, setPrivilege] = useState('student');
  const [formData, setFormData] = useState({
    nume: 'Popescu',
    prenume: 'Ion',
    email: 'nume@exemplu.ro',
    telefon: '+40 700 000 000',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Modificările au fost salvate cu succes!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Pagina */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contul meu</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gestionează datele personale, privilegiul, metodele de plată și limba aplicației
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coloana Stânga: Informații Personale */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Informații personale</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Aceste date sunt folosite pentru confirmările rezervărilor și pentru chitanțe
              </p>
            </div>

            {/* Avatar + Buton schimbare foto */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-900 text-white font-bold text-xl flex items-center justify-center shadow-inner">
                  IP
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {formData.prenume} {formData.nume}
                  </h3>
                  <p className="text-xs text-slate-500">{formData.email}</p>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg flex items-center gap-2 transition-colors"
              >
                <Camera className="w-4 h-4 text-slate-500" />
                Schimbă fotografia
              </button>
            </div>

            {/* Formular Nume / Prenume / Email / Telefon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nume</label>
                <input
                  type="text"
                  name="nume"
                  value={formData.nume}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Prenume</label>
                <input
                  type="text"
                  name="prenume"
                  value={formData.prenume}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Telefon</label>
                <input
                  type="text"
                  name="telefon"
                  value={formData.telefon}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>
            </div>

            {/* Câmp Parolă */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Parolă</label>
                <button
                  type="button"
                  className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Schimbă parola
                </button>
              </div>
              <input
                type="password"
                value="••••••••••••"
                disabled
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
              />
            </div>

            {/* Butoane Acțiune */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm"
              >
                Salvează modificările
              </button>
              <button
                type="button"
                onClick={() => setFormData({ nume: 'Popescu', prenume: 'Ion', email: 'nume@exemplu.ro', telefon: '+40 700 000 000' })}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-lg transition-colors"
              >
                Anulează
              </button>
            </div>
          </form>
        </div>

        {/* Coloana Dreapta: Tip Privilegiu + Limba Aplicației */}
        <div className="space-y-6">
          {/* Card 1: Tip Privilegiu */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Tip privilegiu</h2>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <select
                  value={privilege}
                  onChange={(e) => setPrivilege(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="student">Student</option>
                  <option value="profesor">Cadru didactic / Profesor</option>
                  <option value="extern">Utilizator extern</option>
                </select>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verificat
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <p className="font-medium text-slate-700">Reducere Student (50%) aplicată automat la plată</p>
              <p className="text-slate-400">Email instituțional: nume@student.exemplu.ro</p>
            </div>
          </div>

          {/* Card 2: Limba Aplicației */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-bold text-slate-900">Limba aplicației</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLanguage('ro')}
                className={`py-2 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  language === 'ro'
                    ? 'border-blue-900 bg-blue-50 text-blue-900 ring-1 ring-blue-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🇷🇴 Română</span>
                {language === 'ro' && <Check className="w-4 h-4 text-blue-900" />}
              </button>

              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  language === 'en'
                    ? 'border-blue-900 bg-blue-50 text-blue-900 ring-1 ring-blue-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🇬🇧 English</span>
                {language === 'en' && <Check className="w-4 h-4 text-blue-900" />}
              </button>
            </div>

            <p className="text-xs text-slate-400 italic pt-1">
              Se aplică imediat în toată aplicația
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}