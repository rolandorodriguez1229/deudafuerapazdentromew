import Header from '@/components/Header';
import TrustBar from '@/components/TrustBar';
import HeroSection from '@/components/HeroSection';
import JsonLd from '@/components/JsonLd';
import GuaranteeStrip from '@/components/GuaranteeStrip';
import FinalOfferSection from '@/components/FinalOfferSection';
import TestimonialsHighlightSection from '@/components/TestimonialsHighlightSection';
import ProblemSection from '@/components/ProblemSection';
import SolutionSection from '@/components/SolutionSection';
import StoryTeaserSection from '@/components/StoryTeaserSection';
import StoryTimelineSection from '@/components/StoryTimelineSection';
import BenefitsSection from '@/components/BenefitsSection';
import WhyDifferentSection from '@/components/WhyDifferentSection';
import ForWhoSection from '@/components/ForWhoSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import AuthorSection from '@/components/AuthorSection';
import ProductsSection from '@/components/ProductsSection';
import GuaranteeSection from '@/components/GuaranteeSection';
import FAQSection from '@/components/FAQSection';
import FinalCTASection from '@/components/FinalCTASection';
import StickyCTA from '@/components/StickyCTA';
import Footer from '@/components/Footer';
import ExitIntentModal from '@/components/ExitIntentModal';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.deudafuerapazdentro.com';

const homeJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Deuda Fuera, Paz Dentro',
    url: SITE_URL,
    logo: `${SITE_URL}/images/Deuda Fuera Paz Dentro Portada Ebook.png`,
    founder: { '@type': 'Person', name: 'Rolando Rodríguez' },
    email: 'contacto@deudafuerapazdentro.com',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Deuda Fuera, Paz Dentro',
    url: SITE_URL,
    inLanguage: 'es',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: 'Deuda Fuera, Paz Dentro',
    author: { '@type': 'Person', name: 'Rolando Rodríguez' },
    inLanguage: 'es',
    bookFormat: 'https://schema.org/EBook',
    image: `${SITE_URL}/images/Deuda Fuera Paz Dentro Portada Ebook.png`,
    description:
      'Método para salir de deudas usando IPD, Oxígeno Rápido, Bola de Nieve y Avalancha, adaptado a familias hispanas.',
    offers: {
      '@type': 'Offer',
      price: '7.99',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/comprar`,
    },
  },
];

export default function Home() {
  return (
    <main>
      <JsonLd data={homeJsonLd} />
      <ExitIntentModal />
      <Header />
      <TrustBar />
      <HeroSection />
      <GuaranteeStrip />
      <FinalOfferSection />
      <TestimonialsHighlightSection />
      <StoryTeaserSection />
      <StoryTimelineSection />
      <BenefitsSection />
      <WhyDifferentSection />
      <ForWhoSection />
      <ProblemSection />
      <SolutionSection />
      <TestimonialsSection />
      <AuthorSection />
      <ProductsSection />
      <GuaranteeSection />
      <FAQSection />
      <FinalCTASection />
      <StickyCTA />
      <Footer />
    </main>
  );
}
