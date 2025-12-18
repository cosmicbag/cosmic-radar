'use client';

import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { User, Mail, LogOut, Settings, Shield, Bell } from 'lucide-react';
import Header from '@/components/layout/Header';
import Link from 'next/link';

export default function AccountPage() {
  const { data: session, status } = useSession();

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-card rounded w-1/4"></div>
            <div className="h-48 bg-card rounded-lg"></div>
          </div>
        </main>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-md mx-auto">
            <div className="card text-center">
              <User className="w-16 h-16 text-text-secondary mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
              <p className="text-text-secondary mb-6">
                Sign in to access your account settings and preferences
              </p>
              <button
                onClick={() => signIn()}
                className="w-full py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
              >
                Sign In
              </button>
              <p className="mt-4 text-sm text-text-secondary">
                Don't have an account?{' '}
                <Link href="/auth/signin" className="text-accent hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Account</h1>

        {/* Profile Card */}
        <div className="card mb-6">
          <div className="flex items-center gap-4 mb-6">
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt="Profile"
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <User className="w-8 h-8 text-accent" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold">{session.user?.name || 'User'}</h2>
              <p className="text-text-secondary">{session.user?.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-text-secondary" />
                <span>Email</span>
              </div>
              <span className="text-text-secondary">{session.user?.email}</span>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              Manage your notification preferences
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Price Alerts</span>
                <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                  Coming Soon
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>News Updates</span>
                <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              Manage your account security settings
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Two-Factor Authentication</span>
                <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                  Coming Soon
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Connected Accounts</span>
                <span className="text-text-secondary text-sm">Google</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Preferences
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              Customize your experience
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Currency</span>
                <span className="text-text-secondary">USD</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Theme</span>
                <span className="text-text-secondary">Dark</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="mt-8">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full py-3 bg-negative/10 text-negative rounded-lg hover:bg-negative/20 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </main>
    </div>
  );
}
