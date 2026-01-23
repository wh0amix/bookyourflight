import { motion } from 'motion/react';
import { Shield, Clock, CreditCard, Headphones, Star, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure Booking',
    description: 'Your data is protected with end-to-end encryption and secure payment processing.'
  },
  {
    icon: Clock,
    title: 'Instant Confirmation',
    description: 'Get your booking confirmed instantly and receive your e-ticket in seconds.'
  },
  {
    icon: CreditCard,
    title: 'Flexible Payment',
    description: 'Multiple payment options available with installment plans for your convenience.'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our dedicated support team is available around the clock to assist you.'
  },
  {
    icon: Star,
    title: 'Best Price Guarantee',
    description: "Find a better price? We'll match it and give you an extra 10% off."
  },
  {
    icon: Sparkles,
    title: 'Premium Experience',
    description: 'Enjoy exclusive perks and upgrades with our loyalty rewards program.'
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light mb-4">
            Why Choose Us
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Experience the difference with our world-class service and exclusive benefits
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-8 rounded-2xl bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 border border-white/5 hover:border-orange-500/30 transition-all hover:shadow-xl hover:shadow-orange-500/5"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-xl mb-3">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
