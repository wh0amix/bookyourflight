'use client';

import { motion } from 'motion/react';
import { SearchBar } from './SearchBar';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function HeroSection() {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1920&q=80"
          alt="Private jet flying over mountains"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col pt-24 px-6">
        <div className="max-w-7xl mx-auto w-full">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <SearchBar />
          </motion.div>

          {/* Hero Text */}
          <motion.div
            className="mt-32 max-w-2xl ml-auto mr-12"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-5xl md:text-6xl font-light leading-tight mb-8">
              The Perks of Flying Private
              <br />
              <span className="block mt-2">Book by the seat</span>
              <br />
              <span className="block mt-2">No membership fees</span>
            </h2>

            <button className="group flex items-center gap-2 text-lg hover:gap-4 transition-all duration-300">
              <span><a href='#destinations'>See where we fly</a></span>
              <ArrowRight className="w-5 h-5 text-orange-500" />
            </button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <button className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
            <ChevronDown className="w-6 h-6" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
