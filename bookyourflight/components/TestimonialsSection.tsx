"use client";
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Business Traveler',
    content: 'BookYourFlight made my business trip planning so easy. The interface is intuitive and the customer service is exceptional.',
    rating: 5,
    avatar: 'SJ'
  },
  {
    name: 'Michael Chen',
    role: 'Adventure Seeker',
    content: 'Best flight booking experience ever! Found amazing deals to destinations I never thought I could afford.',
    rating: 5,
    avatar: 'MC'
  },
  {
    name: 'Emma Williams',
    role: 'Family Traveler',
    content: 'Booking flights for my family of 5 was seamless. The flexible payment options were a lifesaver!',
    rating: 5,
    avatar: 'EW'
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-zinc-950 to-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light mb-4">
            What Our Customers Say
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Join thousands of satisfied travelers who trust BookYourFlight
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-8 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-orange-500/30 transition-all"
            >
              <Quote className="absolute top-6 right-6 w-12 h-12 text-orange-500/20" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
                ))}
              </div>

              {/* Content */}
              <p className="text-zinc-300 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-medium">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-medium">{testimonial.name}</div>
                  <div className="text-sm text-zinc-400">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
