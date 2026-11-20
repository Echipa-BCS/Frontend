import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ShieldCheck, Globe, CheckCircle2, AlertCircle, Sun, Moon, Monitor } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import { useThemeStore, type ThemePreference } from '../store/themeStore';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, fetchUserProfile, saveUserProfile } = useBookingStore();
  const { theme, setTheme } = useThemeStore();

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

  const themeOptions: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Luminos', icon: Sun },
    { value: 'dark', label: 'Întunecat', icon: Moon },
    { value: 'system', label: 'Sistem', icon: Monitor },
  ];

  const inputCls =
    'w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Contul meu</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Gestionează datele personale, privilegiul universitar și preferințele aplicației
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coloana Stânga: Informații Personale */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSave}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm transition-colors"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Informații personale
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Aceste date sunt sincronizate cu profilul tău din sistem și apar pe chitanțele de rezervare
              </p>
            </div>

            {/* Avatar */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-900 dark:bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-inner">
                  {initials}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    {formData.prenume} {formData.nume}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formData.email}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold">
                ID Utilizator #{user.id}
              </span>
            </div>

            {/* Formular Nume / Prenume / Email / Telefon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Prenume
                </label>
                <input
                  type="text"
                  name="prenume"
                  required
                  value={formData.prenume}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nume
                </label>
                <input
                  type="text"
                  name="nume"
                  required
                  value={formData.nume}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Telefon
                </label>
                <input
                  type="text"
                  name="telefon"
                  value={formData.telefon}
                  onChange={handleChange}
                  placeholder="07xx xxx xxx"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Butoane Acțiune */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {saving ? 'Se salvează...' : 'Salvează modificările'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm rounded-lg transition-colors cursor-pointer"
              >
                Resetează
              </button>
            </div>
          </form>
        </div>

        {/* Coloana Dreapta: Tip Privilegiu + Aspect Aplicație + Limba Aplicației */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm transition-colors">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Statut & Privilegiu
            </h2>

            <div className="flex items-center justify-between gap-3">
              <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 rounded-lg text-sm font-bold">
                {roleDetails.title} ({user.rol})
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verificat
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {roleDetails.discountText}
              </p>
              <p className="text-slate-400 dark:text-slate-500">Cont asociat: {user.email}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm transition-colors">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Aspect aplicație
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const active = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTheme(opt.value)}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? 'border-blue-900 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 ring-1 ring-blue-900 dark:ring-blue-500'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm transition-colors">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Limba aplicației
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLanguage('ro')}
                className={`py-2 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  language === 'ro'
                    ? 'border-blue-900 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 ring-1 ring-blue-900 dark:ring-blue-500'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span>🇷🇴 Română</span>
                {language === 'ro' && (
                  <Check className="w-4 h-4 text-blue-900 dark:text-blue-300" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  language === 'en'
                    ? 'border-blue-900 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 ring-1 ring-blue-900 dark:ring-blue-500'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span>🇬🇧 English</span>
                {language === 'en' && (
                  <Check className="w-4 h-4 text-blue-900 dark:text-blue-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
