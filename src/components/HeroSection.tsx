import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-law-firm.jpg';

const HeroSection = () => {
  // Número de WhatsApp (cambiar por el número real)
  const whatsappNumber = "573001477860";
  
  const openWhatsAppConsulta = () => {
    const message = "Hola, me gustaría solicitar una consulta legal gratuita. ¿Podrían ayudarme?";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const openWhatsAppServicios = () => {
    const message = "Hola, me gustaría conocer más información sobre sus servicios legales.";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section id="inicio" className="min-h-screen flex items-center relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 gradient-primary opacity-75"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-primary-foreground">
          <h1 className="mb-6 leading-tight">
            Excelencia Jurídica
            <span className="block text-accent">a Su Servicio</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 leading-relaxed max-w-3xl mx-auto opacity-90">
            Con más de 20 años de experiencia, brindamos asesoría legal integral 
            con la máxima profesionalidad y dedicación personalizada para cada cliente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={openWhatsAppConsulta}
              className="text-lg px-8 py-4 shadow-elegant hover:shadow-professional transition-all duration-300 iconW " 
            >
            <img
              src="/whatsapp2.png"
              alt="WhatsApp"
              className="w-6 h-6 object-contain"
            />
             Consulta Express
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-1 h-16 bg-primary-foreground opacity-50 animate-pulse"></div>
      </div>
    </section>
  );
};

export default HeroSection;