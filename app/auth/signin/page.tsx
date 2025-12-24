'use client';

import { signIn, getProviders } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, User } from 'lucide-react';

type AuthMode = 'signin' | 'register';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [mode, setMode] = useState<AuthMode>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [hasGoogleProvider, setHasGoogleProvider] = useState(false);

  // Check if Google provider is available
  useEffect(() => {
    getProviders().then((providers) => {
      setHasGoogleProvider(!!providers?.google);
    });
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      console.log('[Auth] Initiating Google sign-in...');
      await signIn('google', { callbackUrl, redirect: true });
      // Note: If redirect: true, this code won't execute on success
      // The user will be redirected to Google's OAuth page
    } catch (error) {
      console.error('[Auth] Google sign in error:', error);
      setError('Google sign-in is not available. Please use email/password.');
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('[Auth] Attempting email sign-in for:', email);
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('[Auth] Sign-in result:', result);

      if (result?.error) {
        // Check for specific error types
        if (result.error.includes('database') || result.error.includes('connect')) {
          setError('Database connection failed. Please try again later.');
        } else {
          setError('Invalid email or password');
        }
        setIsLoading(false);
      } else {
        window.location.href = callbackUrl;
      }
    } catch (error) {
      console.error('[Auth] Sign in error:', error);
      setError('An error occurred during sign in. Please try again.');
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('[Auth] Attempting registration for:', email);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      console.log('[Auth] Registration response:', response.status, data);

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        setIsLoading(false);
        return;
      }

      // Auto sign in after successful registration
      console.log('[Auth] Registration successful, attempting auto sign-in...');
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Account created but sign in failed. Please try signing in manually.');
        setMode('signin');
        setIsLoading(false);
      } else {
        window.location.href = callbackUrl;
      }
    } catch (error) {
      console.error('[Auth] Registration error:', error);
      setError('An error occurred during registration. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div 
              className="w-24 h-24 bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: 'url(/mascot.png)' }}
              aria-label="Cosmic Radar Mascot"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-text-secondary">
            {mode === 'signin' 
              ? 'Sign in to access watchlists, alerts, and more'
              : 'Join Cosmic Radar to track your crypto portfolio'
            }
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setMode('signin');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              mode === 'signin'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-background text-text-secondary hover:text-text-primary'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              mode === 'register'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-background text-text-secondary hover:text-text-primary'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-negative/10 border border-negative/20 rounded-lg text-negative text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Google Sign In - only show if configured */}
          {hasGoogleProvider ? (
            <>
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isLoading ? 'Processing...' : 'Continue with Google'}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-text-secondary">Or continue with email</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-sm text-text-secondary mb-2">
              Sign in with your email and password
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={mode === 'signin' ? handleEmailSignIn : handleRegister} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name (optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text-primary"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text-primary"
                />
              </div>
              {mode === 'register' && (
                <p className="mt-1 text-xs text-text-secondary">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-text-secondary">
          <p>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
