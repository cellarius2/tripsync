import AboutSection from "../components/landing/AboutSection";
import BenefitsStrip from "../components/landing/BenefitsStrip";
import FeatureCards from "../components/landing/FeatureCards";
import FinalCta from "../components/landing/FinalCta";
import HeroSection from "../components/landing/HeroSection";
import HowItWorks from "../components/landing/HowItWorks";
import LandingFooter from "../components/landing/LandingFooter";
import LandingNavbar from "../components/landing/LandingNavbar";
import TravelBackground from "../components/trip/TravelBackground";

export default function LandingPage() {
  return (
    <div className="landing-shell relative min-h-screen overflow-hidden">
      <LandingNavbar />
      <main className="relative z-[1]">
        <HeroSection />
        <BenefitsStrip />
        <FeatureCards />
        <HowItWorks />
        <AboutSection />
        <div className="landing-lower-shell landing-cta-shell">
          <div className="landing-travel-background landing-lower-background" aria-hidden="true">
            <TravelBackground />
          </div>
          <FinalCta />
        </div>
      </main>
      <div className="relative z-[1]">
        <LandingFooter />
      </div>
    </div>
  );
}
