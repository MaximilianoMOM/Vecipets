import Hero from '@/components/home/Hero';
import AlertsSection from '@/components/home/AlertsSection';
import HowItWorks from '@/components/home/HowItWorks';
import MapSection from '@/components/home/MapSection';
import SupportPlaces from '@/components/home/SupportPlaces';
import FinalCTA from '@/components/home/FinalCTA';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <AlertsSection />
      <HowItWorks />
      <MapSection />
      <SupportPlaces />
      <FinalCTA />
    </div>
  );
}