import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Trophy, User as UserIcon, Phone, Sparkles } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login state
  const [email, setEmail] = useState('alex.popescu@student.usv.ro');
  const [parola, setParola] = useState('password123');

  // Register state
  const [regData, setRegData] = useState({
    prenume: '',
    nume: '',
    email: '',
    telefon: '',
    parola: '',
  });

  const navigate = useNavigate();
  const { login, register, isLoading, authError, clearAuthError, isAuth } = useBookingStore();

  useEffect(() => {
    if (isAuth) {
      navigate('/cautare', { replace: true });
    }
  }, [isAuth, navigate]);

  if (isAuth) {
    return null;
  }

  const switchMode = (newMode: 'login' | 'register') => {
    clearAuthError();
    setMode(newMode);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email.trim(), parola);
      navigate('/cautare');
    } catch {
      // error is set in the store
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        prenume: regData.prenume.trim(),
        nume: regData.nume.trim(),
        email: regData.email.trim(),
        parola: regData.parola,
        telefon: regData.telefon.trim() || undefined,
      });
      navigate('/cautare');
    } catch {
      // error is set in the store
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    clearAuthError();
    setMode('login');
    setEmail(demoEmail);
    setParola('password123');
  };

  const detectedRoleInfo = (() => {
    const targetEmail = (mode === 'login' ? email : regData.email).toLowerCase();
    if (targetEmail.endsWith('@student.usv.ro')) {
      return {
        role: 'STUDENT',
        discount: '40% reducere automată',
        badge:
          'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      };
    }
    if (targetEmail.endsWith('@usm.ro')) {
      return {
        role: 'PROFESOR',
        discount: '20% reducere automată',
        badge:
          'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      };
    }
    return {
      role: 'USER EXTERN',
      discount: 'Tarif standard (0% reducere)',
      badge:
        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    };
  })();

  const inputCls =
    'w-full py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-lg dark:shadow-slate-950/60 border border-slate-100 dark:border-slate-800 p-8 transition-colors">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 rounded-full mb-3">
            <Trophy className="w-8 h-8 text-blue-900 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {mode === 'login' ? 'Autentificare' : 'Creează un cont nou'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'login'
              ? 'Intră în cont pentru a rezerva un teren sportiv'
              : 'Rolul și reducerea se atribuie automat după domeniul adresei de email'}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Autentificare
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Înregistrare
          </button>
        </div>

        {authError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 text-red-700 dark:text-red-300 text-xs font-medium">
            {authError}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nume@student.usv.ro"
                  className={`${inputCls} pl-9 pr-3`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Parolă
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={parola}
                  onChange={(e) => setParola(e.target.value)}
                  required
                  className={`${inputCls} pl-9 pr-20`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPassword ? 'Ascunde' : 'Arată'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className={`px-2.5 py-1 rounded-full border font-semibold ${detectedRoleInfo.badge}`}>
                {detectedRoleInfo.role}: {detectedRoleInfo.discount}
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? 'Autentificare...' : 'Autentificare'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Prenume
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regData.prenume}
                    onChange={(e) => setRegData({ ...regData, prenume: e.target.value })}
                    placeholder="Alex"
                    className={`${inputCls} pl-9 pr-3`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nume
                </label>
                <input
                  type="text"
                  required
                  value={regData.nume}
                  onChange={(e) => setRegData({ ...regData, nume: e.target.value })}
                  placeholder="Popescu"
                  className={`${inputCls} px-3`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  placeholder="student@student.usv.ro sau profesor@usm.ro"
                  className={`${inputCls} pl-9 pr-3`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Telefon (opțional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={regData.telefon}
                  onChange={(e) => setRegData({ ...regData, telefon: e.target.value })}
                  placeholder="0712 345 678"
                  className={`${inputCls} pl-9 pr-3`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Parolă
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={regData.parola}
                  onChange={(e) => setRegData({ ...regData, parola: e.target.value })}
                  placeholder="Minim 6 caractere"
                  className={`${inputCls} pl-9 pr-20`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPassword ? 'Ascunde' : 'Arată'}
                </button>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Rol detectat: <strong>{detectedRoleInfo.role}</strong> ({detectedRoleInfo.discount})
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? 'Se creează contul...' : 'Creează contul'}
            </button>
          </form>
        )}

        {/* Quick-select Demo Accounts */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center mb-2.5">
            Conturi rapide pentru testare (click pentru completare, parolă:{' '}
            <code className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1 py-0.5 rounded">
              password123
            </code>
            ):
          </p>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => fillDemoAccount('alex.popescu@student.usv.ro')}
              className="w-full text-left px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-700 text-xs flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="font-medium text-slate-800 dark:text-slate-200">
                alex.popescu@student.usv.ro
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 rounded font-semibold">
                Student (-40%)
              </span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('ion.ionescu@usm.ro')}
              className="w-full text-left px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-700 text-xs flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="font-medium text-slate-800 dark:text-slate-200">ion.ionescu@usm.ro</span>
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 rounded font-semibold">
                Profesor (-20%)
              </span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('user@gmail.com')}
              className="w-full text-left px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-700 text-xs flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="font-medium text-slate-800 dark:text-slate-200">user@gmail.com</span>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-semibold">
                Utilizator (0%)
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
