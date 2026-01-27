import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Plane, Calendar, Settings } from 'lucide-react';
import './index.css';
import { Dashboard } from './pages/Dashboard';
import clsx from 'clsx';

const SettingsPage = () => (
  <div className="container pt-8 animate-fade-in">
    <div className="glass-card rounded-2xl p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-2">Training Profile</h1>
      <p className="text-slate-400 mb-6">Customize your personal minimums.</p>

      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200">
        Profile Manager coming soon. This will allow you to set custom wind, ceiling, and visibility limits.
      </div>
    </div>
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
          : "text-slate-400 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-deep">
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3 font-display font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-sky-100 to-sky-300 bg-clip-text text-transparent">
              AeroPlan
            </span>
          </div>
          <div className="flex gap-2">
            <NavLink to="/" icon={Calendar} label="Dashboard" />
            <NavLink to="/settings" icon={Settings} label="Profile" />
          </div>
        </div>
      </nav>
      <main className="flex-1 py-6">
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
