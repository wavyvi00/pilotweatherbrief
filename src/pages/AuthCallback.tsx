import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader, CheckCircle, XCircle } from 'lucide-react';

export const AuthCallback = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Confirming your email...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the hash parameters from the URL
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const error = hashParams.get('error');
                const errorDescription = hashParams.get('error_description');

                if (error) {
                    setStatus('error');
                    setMessage(errorDescription?.replace(/\+/g, ' ') || 'An error occurred');
                    return;
                }

                // Check if we have an access token (successful auth)
                const accessToken = hashParams.get('access_token');
                const tokenType = hashParams.get('type');

                if (accessToken && tokenType === 'recovery') {
                    // Password recovery — set session then redirect to reset page
                    setStatus('success');
                    setMessage('Verified! Redirecting to password reset...');
                    setTimeout(() => navigate('/reset-password'), 1500);
                    return;
                }

                if (accessToken) {
                    // Session will be automatically picked up by onAuthStateChange
                    setStatus('success');
                    setMessage('Email confirmed! Redirecting...');
                    setTimeout(() => navigate('/dashboard'), 1500);
                    return;
                }

                // Try to get the session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) throw sessionError;
                
                if (session) {
                    setStatus('success');
                    setMessage('You are signed in! Redirecting...');
                    setTimeout(() => navigate('/dashboard'), 1500);
                } else {
                    setStatus('error');
                    setMessage('No session found. Please try signing in again.');
                }
            } catch (err: any) {
                console.error('Auth callback error:', err);
                setStatus('error');
                setMessage(err.message || 'Something went wrong');
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center">
                {status === 'loading' && (
                    <>
                        <Loader className="w-12 h-12 text-sky-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400">{message}</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                        <p className="text-slate-800 dark:text-white font-medium">{message}</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-slate-800 dark:text-white font-medium mb-4">{message}</p>
                        <button
                            onClick={() => navigate('/auth')}
                            className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Back to Sign In
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
