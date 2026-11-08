import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Trophy } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();
  navigate('/cautare');
};

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 border border-blue-100 rounded-full mb-3">
            <Trophy className="w-8 h-8 text-blue-900" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Autentificare</h1>
          <p className="text-sm text-slate-500 mt-1">Intră în cont pentru a rezerva un teren</p>
          <span className="inline-block mt-3 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
            Exclusiv studenți și profesori
          </span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                defaultValue="nume@exemplu.ro"
                required
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
                defaultValue="password123"
                required
                className="w-full pl-9 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-300 text-blue-900 focus:ring-blue-600" />
              Ține-mă minte
            </label>
            <a href="#" className="text-blue-700 font-semibold hover:underline">Ai uitat parola?</a>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
          >
            Autentificare
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Nu ai cont? <a href="#" className="text-blue-700 font-bold hover:underline">Creează cont</a>
        </div>
      </div>
    </div>
  );
}