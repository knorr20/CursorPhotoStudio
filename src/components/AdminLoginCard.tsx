import React, { useState } from 'react';
import { LockKeyhole, Shield } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type AdminLoginCardProps = {
  /** True when user landed from Supabase password-recovery email link. */
  recoveryFlow?: boolean;
  /** Called after new password is saved so App can hide recovery UI. */
  onRecoveryComplete?: () => void;
};

const redirectUrlForPasswordReset = () => `${window.location.origin}/admin`;

const AdminLoginCard: React.FC<AdminLoginCardProps> = ({
  recoveryFlow = false,
  onRecoveryComplete,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [subView, setSubView] = useState<'login' | 'forgot'>('login');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured in this build.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured in this build.');
      return;
    }

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter the email for your admin account.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: redirectUrlForPasswordReset(),
      });
      if (resetError) throw resetError;
      setInfo(
        'If an account exists for this email, we sent a reset link. Open it and choose a new password on this page.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured in this build.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setInfo('Password updated. Loading admin…');
      window.history.replaceState(null, '', '/admin');
      onRecoveryComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (recoveryFlow) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Set new password</h1>
              <p className="text-sm text-slate-600">Choose a strong password for your admin account.</p>
            </div>
          </div>

          <form onSubmit={handleSetNewPassword} className="space-y-4">
            <label className="block text-sm">
              <span className="block mb-1 text-slate-600">New password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </label>

            <label className="block text-sm">
              <span className="block mb-1 text-slate-600">Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </label>

            {error && (
              <div className="text-sm rounded border border-red-300 bg-red-50 text-red-700 px-3 py-2">
                {error}
              </div>
            )}
            {info && (
              <div className="text-sm rounded border border-green-300 bg-green-50 text-green-800 px-3 py-2">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-60"
            >
              <LockKeyhole className="h-4 w-4" />
              {isSubmitting ? 'Saving…' : 'Save password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">
              {subView === 'login' ? 'Admin Login' : 'Reset password'}
            </h1>
            <p className="text-sm text-slate-600">
              {subView === 'login'
                ? 'Sign in with your Supabase admin user.'
                : 'We will email you a link to set a new password.'}
            </p>
          </div>
        </div>

        {subView === 'login' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <label className="block text-sm">
              <span className="block mb-1 text-slate-600">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2"
                required
              />
            </label>

            <label className="block text-sm">
              <span className="block mb-1 text-slate-600">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2"
                required
              />
            </label>

            {error && (
              <div className="text-sm rounded border border-red-300 bg-red-50 text-red-700 px-3 py-2">
                {error}
              </div>
            )}
            {info && (
              <div className="text-sm rounded border border-green-300 bg-green-50 text-green-800 px-3 py-2">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-60"
            >
              <LockKeyhole className="h-4 w-4" />
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSubView('forgot');
                setError(null);
                setInfo(null);
              }}
              className="w-full text-sm text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline"
            >
              Forgot password?
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <label className="block text-sm">
              <span className="block mb-1 text-slate-600">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2"
                required
              />
            </label>

            {error && (
              <div className="text-sm rounded border border-red-300 bg-red-50 text-red-700 px-3 py-2">
                {error}
              </div>
            )}
            {info && (
              <div className="text-sm rounded border border-green-300 bg-green-50 text-green-800 px-3 py-2">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-60"
            >
              <LockKeyhole className="h-4 w-4" />
              {isSubmitting ? 'Sending…' : 'Send reset link'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSubView('login');
                setError(null);
                setInfo(null);
              }}
              className="w-full text-sm text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline"
            >
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLoginCard;
