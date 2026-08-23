import { useState } from "react";
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import ServicesSection from '@/components/ServicesSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import NewsCarouselSection from '@/components/home/NewsCarouselSection';
import { useSEO } from '@/hooks/useSEO';

const Index = () => {
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [widgetMessage, setWidgetMessage] = useState("");
  useSEO({
    title: "Abogados en Barranquilla | Estudio Jurídico de Confianza",
    description: "Estudio jurídico en Barranquilla con más de 20 años de experiencia. Asesoría en derecho laboral, penal, familiar, civil e inmobiliario. Consulta gratuita por WhatsApp.",
    canonical: "https://www.abogadosbq.com/",
    ogTitle: "Abogados en Barranquilla | Estudio Jurídico de Confianza",
    ogDescription: "Más de 20 años de experiencia en asesoría legal integral. Derecho laboral, penal, familiar, civil e inmobiliario en Barranquilla y la Costa Caribe.",
    ogImage: "https://www.abogadosbq.com/hero-law-firm.jpg",
  });

  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <ServicesSection onSelectService={(title) => { setWidgetMessage(`Necesito consulta sobre ${title}`); setWidgetOpen(true); }} />
      <NewsCarouselSection />
      <ContactSection />
      <Footer />
      <WhatsAppWidget open={widgetOpen} onOpenChange={setWidgetOpen} initialMessage={widgetMessage} />
    </div>
  );
};

export default Index;
