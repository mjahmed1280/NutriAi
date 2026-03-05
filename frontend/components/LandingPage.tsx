import Navbar from './LandingPage/Navbar';
import Hero from './LandingPage/Hero';
import StatsBar from './LandingPage/StatsBar';
import Features from './LandingPage/Features';
import HowItWorks from './LandingPage/HowItWorks';
import FinalCTA from './LandingPage/FinalCTA';

export default function LandingPage() {
  return (
    <div className="bg-[#04090A] min-h-screen">
      <Navbar />
      <Hero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <FinalCTA />
    </div>
  );
}
