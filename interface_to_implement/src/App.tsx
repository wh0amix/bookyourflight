import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { DestinationsSection } from './components/DestinationsSection';
import { FeaturesSection } from './components/FeaturesSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { StatsSection } from './components/StatsSection';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <HeroSection />
      <StatsSection />
      <DestinationsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}