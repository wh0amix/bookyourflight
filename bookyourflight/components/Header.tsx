'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useState } from 'react';

export function Header() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-0 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/bookyourflight-transp.png"
            alt="BookYourFlight"
            width={340}
            height={360}
            className="h-20 w-auto"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/resources" className="text-sm hover:text-orange-500 transition-colors">Vols</Link>
          <a href="#destinations" className="text-sm hover:text-orange-500 transition-colors">Destinations</a>
          <a href="#features" className="text-sm hover:text-orange-500 transition-colors">Features</a>
          <a href="#about" className="text-sm hover:text-orange-500 transition-colors">About</a>

          {isSignedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="text-sm">{user?.firstName || 'Account'}</span>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg overflow-hidden">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-3 hover:bg-zinc-800 transition-colors text-sm"
                    onClick={() => setShowMenu(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/reservations"
                    className="flex items-center gap-2 px-4 py-3 hover:bg-zinc-800 transition-colors text-sm"
                    onClick={() => setShowMenu(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Mes réservations
                  </Link>
                  {user?.publicMetadata?.role === 'ADMIN' && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-zinc-800 transition-colors text-sm border-t border-zinc-800"
                      onClick={() => setShowMenu(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 text-orange-500" />
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 px-4 py-3 hover:bg-zinc-800 transition-colors text-sm w-full text-left border-t border-zinc-800"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/sign-in" className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-sm hover:from-orange-600 hover:to-orange-700 transition-all">
              Sign In
            </Link>
          )}
        </nav>

        <button className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}