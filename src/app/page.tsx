import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ProblemSection from '@/components/ProblemSection';
import SolutionSection from '@/components/SolutionSection';
import AuthorSection from '@/components/AuthorSection';
import LeadMagnetSection from '@/components/LeadMagnetSection';
import ProductsSection from '@/components/ProductsSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Header />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <AuthorSection />
      <LeadMagnetSection />
      <ProductsSection />
      <Footer />
    </main>
  );
}
