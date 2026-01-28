import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Plane, Calendar, Settings } from 'lucide-react';
import './index.css';
import { Dashboard } from './pages/Dashboard';
import { GlassCard } from './components/ui/GlassCard';
import clsx from 'clsx';

const SettingsPage = () => (
  <div className="container pt-8 animate-fade-in">
    <GlassCard className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-2 text-slate-100">Training Profile</h1>
      <p className="text-slate-400 mb-6">Customize your personal minimums.</p>

      <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-200">
        Profile Manager coming soon. This will allow you to set custom wind, ceiling, and visibility limits.
      </div>
    </GlassCard>
  </div>
);

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

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-deep selection:bg-sky-500/30">
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 flex items-center justify-between py-4">
          <div className="flex items-center gap-3 font-display font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Plane className="w-5 h-5 text-white transform -rotate-45" />
            </div>
            <span className="bg-gradient-to-r from-sky-200 to-indigo-300 bg-clip-text text-transparent">
              AeroPlan
            </span>
          </div>
          <div className="flex gap-2">
            <NavLink to="/" icon={Calendar} label="Dashboard" />
            <NavLink to="/settings" icon={Settings} label="Profile" />
          </div>
        </div>
      </nav>
      <main className="flex-1 py-6 relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none"></div>
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
