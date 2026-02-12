import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, Loader, AlertCircle, Plane } from 'lucide-react';

export const AuthPage = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/dashboard';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isForgotPassword) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/callback`,
                });
                if (error) throw error;
                setError('Check your email for a password reset link!');
            } else if (isSignUp) {
                const { error } = await signUp(email, password, displayName);
                if (error) throw error;
                setError('Check your email for a confirmation link!');
            } else {
                const { error } = await signIn(email, password);
                if (error) throw error;
                navigate(redirectTo);
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-500/10 rounded-2xl mb-4">
                        <Plane className="w-8 h-8 text-sky-500" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-slate-800 dark:text-white">
                        {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        {isForgotPassword ? 'Enter your email to receive a reset link' : isSignUp ? 'Start planning your flights' : 'Sign in to your account'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                    {error && (
                        <div className={`flex items-center gap-2 p-3 rounded-lg mb-6 text-sm ${
                            error.includes('Check your email')
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}>
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {isSignUp && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Display Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                    placeholder="Pilot Name"
                                />
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                placeholder="pilot@example.com"
                            />
                        </div>
                    </div>

                    {!isForgotPassword && (
                        <div className="mb-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    )}

                    {!isSignUp && !isForgotPassword && (
                        <div className="text-right mb-6">
                            <button
                                type="button"
                                onClick={() => { setIsForgotPassword(true); setError(null); }}
                                className="text-xs text-sky-500 hover:text-sky-600 font-medium"
                            >
                                Forgot password?
                            </button>
                        </div>
                    )}

                    {isForgotPassword && <div className="mb-6" />}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'
                        )}
                    </button>

                    <div className="mt-6 text-center space-y-2">
                        {isForgotPassword ? (
                            <button
                                type="button"
                                onClick={() => { setIsForgotPassword(false); setError(null); }}
                                className="text-sm text-sky-500 hover:text-sky-600 font-medium"
                            >
                                ← Back to Sign In
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError(null);
                                }}
                                className="text-sm text-sky-500 hover:text-sky-600 font-medium"
                            >
                                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
