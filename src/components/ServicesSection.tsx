import { Building, Users, FileText, Home, Briefcase, Shield, Car, WineOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ServicesSection = () => {
  const services = [
    {
      icon: Users,
      title: 'Derecho Administrativo',
      description: 'Representación administrativa en recursos, gestión de contratos públicos y Consultoría en cumplimiento normativo.'
    },
    {
      icon: Car,
      title: 'Accidentes De Tránsito',
      description: 'Accidentes de tránsito, reclamación por daños materiales, corporales, contractual y extracontractual.'
    },
    {
      icon: Shield,
      title: 'Derecho Penal',
      description: 'Defensa penal, representación en juicios criminales y asesoramiento en materia penal.'
    },
    {
      icon: WineOff,
      title: 'Alcoholemia',
      description: 'Procesos contravesionales por alcohol y suspensión de licencia.'
    },
    {
      icon: Building,
      title: 'Derecho Corporativo',
      description: 'Asesoramiento integral en constitución de empresas, contratos comerciales, fusiones y adquisiciones.'
    },
    {
      icon: Users,
      title: 'Derecho Familiar',
      description: 'Divorcios, custodia de menores, adopciones y todo lo relacionado con el ámbito familiar.'
    },
    {
      icon: FileText,
      title: 'Derecho Civil',
      description: 'Contratos, procesos declarativos, procesos de pertenencia y litigio civiles en general.'
    },
    {
      icon: Home,
      title: 'Derecho Inmobiliario',
      description: 'Compraventa de propiedades, arrendamientos, hipotecas y resolución de conflictos inmobiliarios.'
    },
    {
      icon: Briefcase,
      title: 'Derecho Laboral',
      description: 'Defensa de derechos laborales, despidos injustificados, negociación colectiva y conflictos laborales.'
    }
  ];

  return (
    <section id="servicios" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="mb-6 text-primary">Nuestros Servicios</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Ofrecemos una amplia gama de servicios legales especializados,
              adaptados a las necesidades específicas de cada cliente.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className="bg-card shadow-professional hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 group"
              >
                <CardHeader className="text-center pb-4">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <service.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-primary">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-center">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <Card className="bg-primary shadow-elegant">
              <CardContent className="pt-8 pb-8">
                <h3 className="mb-4 text-primary-foreground">¿Necesita Asesoramiento Legal?</h3>
                <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-6 leading-relaxed">
                  No dude en contactarnos para una consulta inicial gratuita.
                  Nuestro equipo de expertos está listo para ayudarle por WhatsApp.
                </p>
                <button
                  onClick={() => {
                    const message = "Hola, necesito asesoramiento legal. ¿Podrían ayudarme con una consulta gratuita?";
                    const encodedMessage = encodeURIComponent(message);
                    const whatsappUrl = `https://wa.me/573001477860?text=${encodedMessage}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-professional flex items-center justify-center mx-auto space-x-2"
                >
                  <img
                    src="/whatsapp.png"
                    alt="WhatsApp"
                    className="w-6 h-6 object-contain "
                  />
                  <span>Contactar por WhatsApp</span>
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;