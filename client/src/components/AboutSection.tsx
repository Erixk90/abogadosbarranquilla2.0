import { Card, CardContent } from '@/components/ui/card';
import teamPhoto from '@/assets/team-photo.webp';
import { useCms } from '@/context/CmsContext';
import { homeIconConfig } from '@/lib/icons';

const AboutSection = () => {
  const { settings } = useCms();
  const { about } = settings;
  const stats = about.stats.map((stat) => ({
    icon: homeIconConfig[stat.icon]?.icon ?? homeIconConfig.scale.icon,
    value: stat.value,
    label: stat.label,
  }));
  const aboutImage = about.image || teamPhoto;

  return (
    <section id="nosotros" data-scroll-section="true" className="py-20 bg-secondary scroll-mt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="mb-6 text-primary">{about.title}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {about.description}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Image */}
            <div className="order-2 lg:order-1">
              <img 
                src={aboutImage} 
                alt={about.imageAlt}
                loading="lazy"
                decoding="async"
                className="w-full h-96 object-cover rounded-lg shadow-elegant"
              />
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <h3 className="mb-6 text-primary">{about.storyTitle}</h3>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                {about.story.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
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
                <h3 className="mb-4 text-primary">{about.missionTitle}</h3>
                <p className="text-lg text-accent-foreground max-w-4xl mx-auto leading-relaxed">
                  {about.mission}
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
