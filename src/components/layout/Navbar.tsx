import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useBookingStore } from '../../store/bookingStore';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuth, logout } = useBookingStore();

  const navLinks = [
    { name: 'Căutare', path: '/cautare' },
    { name: 'Rezervările mele', path: '/rezervarile-mele' },
    { name: 'Abonamente', path: '/abonamente' },
    { name: 'Contul meu', path: '/contul-meu' },
  ];

  const isLoginPage = location.pathname === '/' || location.pathname === '/login';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleBadge =
    user?.rol === 'STUDENT'
      ? { label: 'Student -40%', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      : user?.rol === 'PROFESOR'
      ? { label: 'Profesor -20%', cls: 'bg-blue-50 text-blue-700 border-blue-200' }
      : null;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to={isAuth ? '/cautare' : '/'} className="flex items-center gap-3">
          <img src={logo} alt="SportUniverz Logo" className="h-10 w-auto object-contain" />
          <div>
            <span className="font-bold text-lg text-slate-900 block leading-none">SportUniverz</span>
            <span className="text-xs text-slate-500">Rezervări sportive pentru universitate</span>
          </div>
        </Link>

        {isLoginPage && !isAuth ? (
          <Link
            to="/cautare"
            className="px-4 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
          >
            Vezi terenurile →
          </Link>
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
                  <Link
                    to="/contul-meu"
                    className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Contul meu"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-900 text-white text-xs font-bold flex items-center justify-center">
                      {user.prenume?.charAt(0) ?? 'U'}
                      {user.nume?.charAt(0) ?? ''}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-slate-700">
                      {user.prenume} {user.nume}
                    </span>
                    {roleBadge && (
                      <span
                        className={`hidden lg:inline-block px-2 py-0.5 text-[11px] font-semibold border rounded-full ${roleBadge.cls}`}
                      >
                        {roleBadge.label}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Delogare</span>
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

      {/* Mobile Navigation Bar */}
      {!isLoginPage && (
        <div className="md:hidden border-t border-slate-100 px-3 py-1.5 flex items-center justify-around bg-slate-50/70 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                  isActive ? 'bg-blue-900 text-white font-bold' : 'text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
