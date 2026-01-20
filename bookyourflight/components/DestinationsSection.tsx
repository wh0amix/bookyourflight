'use client';

import { motion } from 'motion/react';
import { ArrowRight, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const destinations = [
  {
    city: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1723142481972-da7b9a628f26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyJTIwYWVyaWFsfGVufDF8fHx8MTc2ODkwNzYwMnww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 'From €450'
  },
  {
    city: 'Dubai',
    country: 'UAE',
    image: 'https://images.unsplash.com/photo-1657106251952-2d584ebdf886?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkdWJhaSUyMHNreWxpbmUlMjBuaWdodHxlbnwxfHx8fDE3Njg4ODA3NTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 'From €620'
  },
  {
    city: 'New York',
    country: 'USA',
    image: 'https://images.unsplash.com/photo-1572536977487-697d036fa442?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjB5b3JrJTIwY2l0eSUyMG1hbmhhdHRhbnxlbnwxfHx8fDE3Njg5MDc2MDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 'From €780'
  },
  {
    city: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1648871647634-0c99b483cb63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMGphcGFuJTIwY2l0eXNjYXBlfGVufDF8fHx8MTc2ODg5MjQ2M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 'From €890'
  },
  {
    city: 'London',
    country: 'UK',
    image: 'https://images.unsplash.com/photo-1745016176874-cd3ed3f5bfc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb25kb24lMjBiaWclMjBiZW58ZW58MXx8fHwxNzY4ODcyODc2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 'From €380'
  },
  {
    city: 'Maldives',
    country: 'Maldives',
    image: 'https://images.unsplash.com/photo-1727874098383-8538af9d76bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxkaXZlcyUyMGJlYWNoJTIwcmVzb3J0fGVufDF8fHx8MTc2ODc5MTU4N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 'From €1,200'
  }
];

export function DestinationsSection() {
  return (
    <section id="destinations" className="py-20 px-6 bg-gradient-to-b from-black to-zinc-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light mb-4">
            Popular Destinations
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Discover amazing places around the world with our exclusive flight deals
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.city}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl cursor-pointer"
            >
              <div className="aspect-[4/5] relative">
                <ImageWithFallback
                  src={destination.image}
                  alt={`${destination.city}, ${destination.country}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                
                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex items-center gap-2 text-sm text-zinc-300 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{destination.country}</span>
                  </div>
                  <h3 className="text-3xl font-light mb-3">{destination.city}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-500 font-medium">{destination.price}</span>
                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <button className="px-8 py-4 border border-white/20 rounded-xl hover:bg-white/5 transition-all group">
            <span className="flex items-center gap-2">
              View All Destinations
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
