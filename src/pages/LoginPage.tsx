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
      return { role: 'STUDENT', discount: '40% reducere automată', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (targetEmail.endsWith('@usm.ro')) {
      return { role: 'PROFESOR', discount: '20% reducere automată', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
    return { role: 'USER EXTERN', discount: 'Tarif standard (0% reducere)', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
  })();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 border border-blue-100 rounded-full mb-3">
            <Trophy className="w-8 h-8 text-blue-900" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'login' ? 'Autentificare' : 'Creează un cont nou'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {mode === 'login'
              ? 'Intră în cont pentru a rezerva un teren sportiv'
              : 'Rolul și reducerea se atribuie automat după domeniul adresei de email'}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Autentificare
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Înregistrare
          </button>
        </div>

        {authError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {authError}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nume@student.usv.ro"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Parolă</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={parola}
                  onChange={(e) => setParola(e.target.value)}
                  required
                  className="w-full pl-9 pr-20 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
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
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm disabled:opacity-60"
            >
              {isLoading ? 'Autentificare...' : 'Autentificare'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Prenume</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regData.prenume}
                    onChange={(e) => setRegData({ ...regData, prenume: e.target.value })}
                    placeholder="Alex"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nume</label>
                <input
                  type="text"
                  required
                  value={regData.nume}
                  onChange={(e) => setRegData({ ...regData, nume: e.target.value })}
                  placeholder="Popescu"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  placeholder="student@student.usv.ro sau profesor@usm.ro"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Telefon (opțional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={regData.telefon}
                  onChange={(e) => setRegData({ ...regData, telefon: e.target.value })}
                  placeholder="0712 345 678"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Parolă</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={regData.parola}
                  onChange={(e) => setRegData({ ...regData, parola: e.target.value })}
                  placeholder="Minim 6 caractere"
                  className="w-full pl-9 pr-20 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPassword ? 'Ascunde' : 'Arată'}
                </button>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Rol detectat: <strong>{detectedRoleInfo.role}</strong> ({detectedRoleInfo.discount})
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm disabled:opacity-60"
            >
              {isLoading ? 'Se creează contul...' : 'Creează contul'}
            </button>
          </form>
        )}

        {/* Quick-select Demo Accounts */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 text-center mb-2.5">
            Conturi rapide pentru testare (click pentru completare, parolă: <code className="bg-slate-100 px-1 py-0.5 rounded">password123</code>):
          </p>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => fillDemoAccount('alex.popescu@student.usv.ro')}
              className="w-full text-left px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-xs flex items-center justify-between transition-colors"
            >
              <span className="font-medium text-slate-800">alex.popescu@student.usv.ro</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">Student (-40%)</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('ion.ionescu@usm.ro')}
              className="w-full text-left px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-xs flex items-center justify-between transition-colors"
            >
              <span className="font-medium text-slate-800">ion.ionescu@usm.ro</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">Profesor (-20%)</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('user@gmail.com')}
              className="w-full text-left px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-xs flex items-center justify-between transition-colors"
            >
              <span className="font-medium text-slate-800">user@gmail.com</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">Utilizator (0%)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
