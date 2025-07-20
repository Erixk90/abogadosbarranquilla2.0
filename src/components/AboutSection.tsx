import { Scale, Users, Award, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import teamPhoto from '@/assets/team-photo.jpg';

const AboutSection = () => {
  const stats = [
    { icon: Scale, value: '1000+', label: 'Casos Exitosos' },
    { icon: Users, value: '20+', label: 'Años de Experiencia' },
    { icon: Award, value: '95%', label: 'Casos Ganados' },
    { icon: Clock, value: '24/7', label: 'Atención al Cliente' },
  ];

  return (
    <section id="nosotros" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="mb-6 text-primary">Nosotros</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Somos un estudio jurídico comprometido con la excelencia, la integridad y 
              la obtención de resultados excepcionales para nuestros clientes.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Image */}
            <div className="order-2 lg:order-1">
              <img 
                src={teamPhoto} 
                alt="Equipo profesional del estudio jurídico"
                className="w-full h-96 object-cover rounded-lg shadow-elegant"
              />
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <h3 className="mb-6 text-primary">Nuestra Historia</h3>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Fundado en 2003, nuestro estudio jurídico ha crecido hasta convertirse 
                  en una de las firmas legales más respetadas y confiables de la región.
                </p>
                <p>
                  Nuestro equipo de abogados altamente calificados se especializa en diversas 
                  áreas del derecho, garantizando una representación integral y especializada 
                  para cada caso.
                </p>
                <p>
                  Creemos firmemente en la importancia de construir relaciones duraderas 
                  con nuestros clientes, basadas en la confianza, la transparencia y 
                  resultados excepcionales.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center bg-card shadow-professional hover:shadow-elegant transition-all duration-300">
                <CardContent className="pt-6">
                  <stat.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mission */}
          <div className="mt-16 text-center">
            <Card className="bg-accent shadow-elegant">
              <CardContent className="pt-8 pb-8">
                <h3 className="mb-4 text-primary">Nuestra Misión</h3>
                <p className="text-lg text-accent-foreground max-w-4xl mx-auto leading-relaxed">
                  Proporcionar servicios legales de la más alta calidad, combinando experiencia, 
                  innovación y un compromiso inquebrantable con la justicia. Trabajamos 
                  incansablemente para proteger los derechos e intereses de nuestros clientes, 
                  siempre con integridad y profesionalismo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;