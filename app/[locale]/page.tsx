import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Manifesto from '@/components/Manifesto';
import PropertyManagement from '@/components/PropertyManagement';
import Accessories from '@/components/Accessories';
import Portfolio from '@/components/Portfolio';
import Presence from '@/components/Presence';
import WhyUs from '@/components/WhyUs';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Manifesto />
        <PropertyManagement />
        <Accessories />
        <Portfolio />
        <Presence />
        <WhyUs />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
