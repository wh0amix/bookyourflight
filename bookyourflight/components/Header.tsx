'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/bookyourflight-transp.png"
            alt="BookYourFlight"
            width={240}
            height={60}
            className="h-14 w-auto"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#destinations" className="text-sm hover:text-orange-500 transition-colors">Destinations</a>
          <a href="#features" className="text-sm hover:text-orange-500 transition-colors">Features</a>
          <a href="#about" className="text-sm hover:text-orange-500 transition-colors">About</a>
          <Link href="/sign-in" className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-sm hover:from-orange-600 hover:to-orange-700 transition-all">
            Sign In
          </Link>
        </nav>

        <button className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
