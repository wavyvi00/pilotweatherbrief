import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Calendar, Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import './index.css';
import { Dashboard } from './pages/Dashboard';
import { LandingPage } from './pages/LandingPage';
import { SettingsPage } from './pages/Settings';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { SupportPage } from './pages/Support';
import { Footer } from './components/Footer';
import clsx from 'clsx';
import flightSoloLogo from './assets/flightsolo_icon.png';

function NavLink({ to, icon: Icon, label }: { to: string, icon: any, label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
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

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-deep selection:bg-sky-500/30">
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3 font-display font-bold text-xl tracking-tight">
            <img src={flightSoloLogo} alt="FlightSolo" className="w-8 h-8 object-contain" />
            <span className="bg-gradient-to-r from-sky-200 to-indigo-300 bg-clip-text text-transparent">
              FlightSolo
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <NavLink to="/dashboard" icon={Calendar} label="Dashboard" />
            <NavLink to="/settings" icon={Settings} label="Profile" />
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <main className="flex-1 py-6 relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none"></div>
        {children}
        <Footer />
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/support" element={<SupportPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
