import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

const stats = [
  { value: 150, label: 'Destinations', suffix: '+' },
  { value: 50000, label: 'Happy Travelers', suffix: '+' },
  { value: 24, label: 'Customer Support', suffix: '/7' },
  { value: 99, label: 'Satisfaction Rate', suffix: '%' }
];

function CountUp({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / (duration * 1000);

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
}

export function StatsSection() {
  return (
    <section className="py-16 px-6 bg-zinc-950/50 border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-light mb-2 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                <CountUp end={stat.value} />
                {stat.suffix}
              </div>
              <div className="text-zinc-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
