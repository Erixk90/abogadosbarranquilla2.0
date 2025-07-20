import { useState } from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const ContactSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const contactInfo = [
    {
      icon: Phone,
      title: 'WhatsApp',
      info: '+57 300 8471898',
      link: 'https://wa.me/573008471898?text=Hola,%20me%20gustaría%20solicitar%20información%20sobre%20sus%20servicios%20legales'
    },
    {
      icon: Mail,
      title: 'Email',
      info: 'director@abogadosbq.com',
      link: 'mailto:director@abogadosbq.com'
    },
    {
      icon: MapPin,
      title: 'Dirección',
      info: '080001 Barranquilla',
      link: 'https://maps.google.com'
    },
    {
      icon: Clock,
      title: 'Horario',
      info: 'Lunes a Domingo: 00:00 - 24:00',
      link: null
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos del formulario.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Por favor, ingrese un email válido.",
        variant: "destructive",
      });
      return;
    }

    // Redirect to WhatsApp with form data
    const whatsappMessage = `Hola, mi nombre es ${formData.name}.

Email: ${formData.email}

Consulta: ${formData.message}

Solicito una consulta legal gratuita. Gracias.`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/573008471898?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    toast({
      title: "¡Redirigiendo a WhatsApp!",
      description: "Se abrirá WhatsApp con su consulta prellenada.",
    });

    // Reset form
    setFormData({
      name: '',
      email: '',
      message: ''
    });
  };

  return (
    <section id="contacto" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="mb-6 text-primary">Contacto</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Estamos aquí para ayudarle. Contáctenos para una consulta inicial
              gratuita y personalizada.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h3 className="mb-8 text-primary">Información de Contacto</h3>
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <Card key={index} className="bg-card shadow-professional">
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <item.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-1">{item.title}</h4>
                          {item.link ? (
                            <a
                              href={item.link}
                              className="text-muted-foreground hover:text-primary transition-colors duration-300"
                            >
                              {item.info}
                            </a>
                          ) : (
                            <p className="text-muted-foreground">{item.info}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Office Hours */}
              <Card className="mt-8 bg-accent shadow-professional">
                <CardHeader>
                  <CardTitle className="text-accent-foreground">Horarios de Atención</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-accent-foreground">
                    <div className="flex justify-between">
                      <span>Lunes - Viernes:</span>
                      <span className="font-semibold">00:00 - 24:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sábados:</span>
                      <span className="font-semibold">00:00 - 24:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domingos:</span>
                      <span className="font-semibold">00:00 - 24:00</span>
                    </div>
                  </div>
                  <p className="text-sm text-accent-foreground/80 mt-4">
                    * Consultas de emergencia disponibles 24/7
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="bg-card shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-primary">Envíenos un Mensaje</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-foreground">Nombre Completo</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Su nombre completo"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-foreground">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="su.email@ejemplo.com"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-foreground">Mensaje</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Cuéntenos sobre su consulta legal..."
                        className="mt-1 min-h-32"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full text-lg py-3 shadow-professional hover:shadow-elegant transition-all duration-300 bg-green-500 hover:bg-green-600 flex items-center justify-center space-x-2"
                    >
                      <img
                        src="/whatsapp.png"
                        alt="WhatsApp"
                        className="w-6 h-6 object-contain"
                      />
                      <span>Enviar por WhatsApp</span>
                    </Button>

                    <p className="text-sm text-muted-foreground text-center">
                      Al enviar este formulario, se abrirá WhatsApp con su consulta
                      prellenada para contactar directamente con nuestros abogados.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;