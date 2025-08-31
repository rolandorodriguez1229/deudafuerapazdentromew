import Header from '@/components/Header';
import TrustBar from '@/components/TrustBar';
import HeroSection from '@/components/HeroSection';
import ProblemSection from '@/components/ProblemSection';
import SolutionSection from '@/components/SolutionSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import AuthorSection from '@/components/AuthorSection';
import LeadMagnetSection from '@/components/LeadMagnetSection';
import ProductsSection from '@/components/ProductsSection';
import GuaranteeSection from '@/components/GuaranteeSection';
import FAQSection from '@/components/FAQSection';
import FinalCTASection from '@/components/FinalCTASection';
import StickyCTA from '@/components/StickyCTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Header />
      <TrustBar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <TestimonialsSection />
      <AuthorSection />
      <LeadMagnetSection />
      <ProductsSection />
      <GuaranteeSection />
      <FAQSection />
      <FinalCTASection />
      <StickyCTA />
      <Footer />
    </main>
  );
}
