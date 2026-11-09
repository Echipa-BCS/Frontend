import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useBookingStore } from '../../store/bookingStore';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const { user, isAuth, logout } = useBookingStore();

  const navLinks = [
    { name: 'Căutare', path: '/cautare' },
    { name: 'Rezervările mele', path: '/rezervarile-mele' },
    { name: 'Abonamente', path: '/abonamente' },
  ];

  const isLoginPage = location.pathname === '/' || location.pathname === '/login';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/cautare" className="flex items-center gap-3">
          <img src={logo} alt="SportUniverz Logo" className="h-10 w-auto object-contain" />
          <div>
            <span className="font-bold text-lg text-slate-900 block leading-none">SportUniverz</span>
            <span className="text-xs text-slate-500">Rezervări sportive pentru universitate</span>
          </div>
        </Link>

        {isLoginPage ? (
          <button className="px-4 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
            Contact
          </button>
        ) : (
          <>
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              {isAuth && user ? (
                <div className="flex items-center gap-2 pl-2">
                  <div className="w-7 h-7 rounded-full bg-blue-900 text-white text-xs font-bold flex items-center justify-center">
                    {user.prenume.charAt(0)}{user.nume.charAt(0)}
                  </div>
                  <span className="hidden sm:inline text-sm text-slate-700">{user.prenume}</span>
                  <button
                    onClick={logout}
                    className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3 h-3" /> Delogare
                  </button>
                </div>
              ) : (
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 font-medium text-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-900 text-white text-xs font-bold flex items-center justify-center">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="hidden sm:inline">Conectare</span>
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
