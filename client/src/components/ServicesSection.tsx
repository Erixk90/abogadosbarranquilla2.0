import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCms } from '@/context/CmsContext';
import { homeIconConfig } from '@/lib/icons';

const ServicesSection = ({ onSelectService }: { onSelectService?: (title: string) => void }) => {
  const { services, settings } = useCms();
  const activeServices = services.filter((service) => service.active);
  const { whatsappNumber, whatsappMessage } = settings.contact;

  return (
    <section id="servicios" data-scroll-section="true" className="py-20 bg-background scroll-mt-24">
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
            {activeServices.map((service) => {
              const config = homeIconConfig[service.icon] ?? homeIconConfig.scale;
              const Icon = config.icon;

              return (
                <Card
                  key={service.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onSelectService?.(service.title);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectService?.(service.title);
                    }
                  }}
                  className="bg-card shadow-professional hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <CardHeader className="text-center pb-4">
                    <div className="mb-4 flex justify-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                        <Icon className="h-8 w-8 text-primary" />
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
              );
            })}
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
                    const message = whatsappMessage || "Hola, necesito asesoramiento legal. ¿Podrían ayudarme con una consulta gratuita?";
                    const encodedMessage = encodeURIComponent(message);
                    const whatsappUrl = `https://wa.me/${whatsappNumber || "573001477860"}?text=${encodedMessage}`;
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
