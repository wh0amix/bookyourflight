import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Plane, MapPin, Calendar, Users, ChevronDown } from 'lucide-react';

export function SearchBar() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [guests, setGuests] = useState(1);
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  return (
    <motion.div
      className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-white/10"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row items-stretch gap-2">
        {/* From */}
        <div className="flex-1 group relative">
          <label className="absolute top-2 left-4 text-xs text-zinc-400">From</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 mt-2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-transparent pt-7 pb-3 pl-11 pr-4 text-white placeholder:text-zinc-500 focus:outline-none rounded-xl hover:bg-white/5 focus:bg-white/5 transition-colors"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-white/10 my-3"></div>

        {/* To */}
        <div className="flex-1 group relative">
          <label className="absolute top-2 left-4 text-xs text-zinc-400">To</label>
          <div className="relative">
            <Plane className="absolute left-4 top-1/2 -translate-y-1/2 mt-2 w-4 h-4 text-zinc-500 rotate-90" />
            <input
              type="text"
              placeholder="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-transparent pt-7 pb-3 pl-11 pr-4 text-white placeholder:text-zinc-500 focus:outline-none rounded-xl hover:bg-white/5 focus:bg-white/5 transition-colors"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-white/10 my-3"></div>

        {/* Guests */}
        <div className="w-full md:w-32 group relative">
          <label className="absolute top-2 left-4 text-xs text-zinc-400">Guests</label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 mt-2 w-4 h-4 text-zinc-500" />
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full bg-transparent pt-7 pb-3 pl-11 pr-8 text-white appearance-none focus:outline-none rounded-xl hover:bg-white/5 focus:bg-white/5 transition-colors cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num} className="bg-zinc-900">
                  {num}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 mt-2 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-white/10 my-3"></div>

        {/* Depart */}
        <div className="flex-1 group relative">
          <label className="absolute top-2 left-4 text-xs text-zinc-400">Depart</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 mt-2 w-4 h-4 text-zinc-500" />
            <input
              type="date"
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
              className="w-full bg-transparent pt-7 pb-3 pl-11 pr-4 text-white focus:outline-none rounded-xl hover:bg-white/5 focus:bg-white/5 transition-colors [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-white/10 my-3"></div>

        {/* Return */}
        <div className="flex-1 group relative">
          <label className="absolute top-2 left-4 text-xs text-zinc-400">Return</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 mt-2 w-4 h-4 text-zinc-500" />
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full bg-transparent pt-7 pb-3 pl-11 pr-4 text-white focus:outline-none rounded-xl hover:bg-white/5 focus:bg-white/5 transition-colors [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Search Button */}
        <motion.button
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowRight className="w-6 h-6" />
        </motion.button>
      </div>
    </motion.div>
  );
}
