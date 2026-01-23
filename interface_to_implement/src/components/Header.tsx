import { Menu } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
          <h1 className="text-2xl font-bold tracking-tight">BookYourFlight</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#destinations" className="text-sm hover:text-orange-500 transition-colors">Destinations</a>
          <a href="#features" className="text-sm hover:text-orange-500 transition-colors">Features</a>
          <a href="#about" className="text-sm hover:text-orange-500 transition-colors">About</a>
          <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-sm hover:from-orange-600 hover:to-orange-700 transition-all">
            Sign In
          </button>
        </nav>
        
        <button className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}