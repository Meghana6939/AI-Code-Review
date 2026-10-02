import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Code2, Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Review', path: '/review' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'History', path: '/history' },
  ];

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-slate-950/75 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08]">
            <Code2 className="h-5 w-5 text-cyan-300" />
          </span>
          <span className="text-lg font-bold tracking-tight">AI Code Reviewer</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  active ? 'bg-white/[0.07] text-cyan-200' : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          {/* Auth Buttons / Profile Menu */}
          {isAuthenticated ? (
            <div className="ml-3 relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.08] hover:text-white"
              >
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/[0.1] bg-slate-950/95 shadow-xl backdrop-blur-xl">
                  <div className="border-b border-white/[0.07] p-3">
                    <div className="text-sm font-medium text-white">{user?.name}</div>
                    <div className="text-xs text-slate-500">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                      navigate('/login');
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:bg-white/[0.05] hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="ml-3 secondary-btn px-4 py-2 text-sm">
                Sign in
              </Link>
              <Link to="/signup" className="ml-2 primary-btn px-4 py-2 text-sm">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle navigation">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-white/[0.06] bg-slate-950/95 px-4 py-3 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm text-slate-300 hover:bg-white/[0.05]"
            >
              {item.name}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <div className="border-t border-white/[0.07] mt-2 pt-2">
                <div className="px-3 py-2 text-sm text-slate-400">{user?.name}</div>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                    navigate('/login');
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:bg-white/[0.05] hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="border-t border-white/[0.07] mt-2 pt-2 space-y-2">
                <Link to="/login" onClick={() => setIsOpen(false)} className="block rounded-lg px-3 py-3 text-sm text-slate-300 hover:bg-white/[0.05]">
                  Sign in
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)} className="block rounded-lg px-3 py-3 text-sm text-cyan-300 hover:bg-white/[0.05]">
                  Sign up
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
