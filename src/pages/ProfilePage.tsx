import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ShieldCheck, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, fetchUserProfile, saveUserProfile } = useBookingStore();

  const [language, setLanguage] = useState<'ro' | 'en'>('ro');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nume: user?.nume ?? '',
    prenume: user?.prenume ?? '',
    email: user?.email ?? '',
    telefon: user?.telefon ?? '',
  });

  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }
    fetchUserProfile().then((fresh) => {
      if (fresh) {
        setFormData({
          nume: fresh.nume ?? '',
          prenume: fresh.prenume ?? '',
          email: fresh.email ?? '',
          telefon: fresh.telefon ?? '',
        });
      }
    });
  }, [userId, fetchUserProfile, navigate]);

  if (!user) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaveSuccess(null);
    setSaveError(null);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);
    try {
      await saveUserProfile({
        nume: formData.nume.trim(),
        prenume: formData.prenume.trim(),
        email: formData.email.trim(),
        telefon: formData.telefon.trim() || undefined,
      });
      setSaveSuccess('Modificările profilului au fost salvate în baza de date!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Nu s-au putut salva modificările.';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSaveSuccess(null);
    setSaveError(null);
    setFormData({
      nume: user.nume ?? '',
      prenume: user.prenume ?? '',
      email: user.email ?? '',
      telefon: user.telefon ?? '',
    });
  };

  const roleDetails =
    user.rol === 'STUDENT'
      ? {
          title: 'Student Universitar',
          discountText: 'Reducere Student (40%) aplicată automat la fiecare rezervare și abonament',
        }
      : user.rol === 'PROFESOR'
      ? {
          title: 'Cadru Didactic / Profesor',
          discountText: 'Reducere Profesor (20%) aplicată automat la fiecare rezervare și abonament',
        }
      : {
          title: 'Utilizator Extern',
          discountText: 'Tarif standard (0% reducere). Folosește o adresă @student.usv.ro sau @usm.ro la înregistrare pentru reducere.',
        };

  const initials = `${(formData.prenume || 'U').charAt(0)}${(formData.nume || '').charAt(0)}`.toUpperCase();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contul meu</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gestionează datele personale, privilegiul universitar și preferințele aplicației
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coloana Stânga: Informații Personale */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-900">Informații personale</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Aceste date sunt sincronizate cu profilul tău din sistem și apar pe chitanțele de rezervare
              </p>
            </div>

            {/* Avatar */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-900 text-white font-bold text-xl flex items-center justify-center shadow-inner">
                  {initials}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {formData.prenume} {formData.nume}
                  </h3>
                  <p className="text-xs text-slate-500">{formData.email}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                ID Utilizator #{user.id}
              </span>
            </div>

            {/* Formular Nume / Prenume / Email / Telefon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Prenume
                </label>
                <input
                  type="text"
                  name="prenume"
                  required
                  value={formData.prenume}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nume
                </label>
                <input
                  type="text"
                  name="nume"
                  required
                  value={formData.nume}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Telefon
                </label>
                <input
                  type="text"
                  name="telefon"
                  value={formData.telefon}
                  onChange={handleChange}
                  placeholder="07xx xxx xxx"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>
            </div>

            {/* Butoane Acțiune */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-60"
              >
                {saving ? 'Se salvează...' : 'Salvează modificările'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-lg transition-colors"
              >
                Resetează
              </button>
            </div>
          </form>
        </div>

        {/* Coloana Dreapta: Tip Privilegiu + Limba Aplicației */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Statut & Privilegiu</h2>

            <div className="flex items-center justify-between gap-3">
              <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-sm font-bold">
                {roleDetails.title} ({user.rol})
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verificat
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <p className="font-medium text-slate-700">{roleDetails.discountText}</p>
              <p className="text-slate-400">Cont asociat: {user.email}</p>
            </div>
          </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}
