import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Calendar, Settings, Moon, Sun, LogIn, LogOut, User, Menu, X, Zap } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RevenueCatProvider } from './contexts/RevenueCatContext';
import './index.css';
import { Dashboard } from './pages/Dashboard';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/Auth';
import { AuthCallback } from './pages/AuthCallback';
import { ResetPassword } from './pages/ResetPassword';
import { SettingsPage } from './pages/Settings';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { SupportPage } from './pages/Support';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { Footer } from './components/Footer';
import clsx from 'clsx';
import flightSoloLogo from './assets/flightsolo_icon.png';

function NavLink({ to, icon: Icon, label, onClick }: { to: string, icon: any, label: string, onClick?: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
        isActive
          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_10px_rgba(14,165,233,0.1)]"
          : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}

function MobileNavLink({ to, icon: Icon, label, onClick }: { to: string, icon: any, label: string, onClick?: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all",
        isActive
          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
          : "text-slate-300 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon className="w-5 h-5" />
      {label}
    </Link>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all duration-300"
      title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

function AuthButton({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20">
          <User className="w-4 h-4 text-sky-400" />
          <span className="text-sm text-sky-400 font-medium truncate max-w-[120px]">
            {user.user_metadata?.display_name || user.email?.split('@')[0]}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all duration-300"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { navigate('/auth'); onNavigate?.(); }}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all duration-300"
    >
      <LogIn className="w-4 h-4" />
      <span className="hidden sm:inline">Sign In</span>
    </button>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-deep selection:bg-sky-500/30">
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 flex items-center justify-between py-3 md:py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 font-display font-bold text-lg md:text-xl tracking-tight">
            <img src={flightSoloLogo} alt="FlightSolo" className="w-7 h-7 md:w-8 md:h-8 object-contain" />
            <span className="bg-gradient-to-r from-sky-200 to-indigo-300 bg-clip-text text-transparent">
              FlightSolo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/dashboard" icon={Calendar} label="Dashboard" />
            <NavLink to="/settings" icon={Settings} label="Profile" />
            <NavLink to="/subscription" icon={Zap} label="Go Pro" />
            <ThemeToggle />
            <AuthButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/5 p-4 animate-fade-in">
            <div className="flex flex-col gap-2">
              <MobileNavLink to="/dashboard" icon={Calendar} label="Dashboard" onClick={() => setMobileMenuOpen(false)} />
              <MobileNavLink to="/settings" icon={Settings} label="Profile" onClick={() => setMobileMenuOpen(false)} />
              <MobileNavLink to="/subscription" icon={Zap} label="Go Pro" onClick={() => setMobileMenuOpen(false)} />
              <div className="border-t border-white/10 my-2" />
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm text-slate-400">Theme</span>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm text-slate-400">Account</span>
                <AuthButton onNavigate={() => setMobileMenuOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </nav>
      <main className="flex-1 py-4 md:py-6 relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none"></div>
        {children}
        <Footer />
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <RevenueCatProvider>
            <AppRoutes />
          </RevenueCatProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
