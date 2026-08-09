import { useState } from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCms } from '@/context/CmsContext';

const ContactSection = () => {
  const { toast } = useToast();
  const { settings } = useCms();
  const { contact } = settings;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const contactInfo = [
    {
      icon: Phone,
      title: contact.phoneLabel,
      info: contact.phone,
      link: `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(contact.whatsappMessage)}`
    },
    {
      icon: Mail,
      title: 'Email',
      info: contact.email,
      link: `mailto:${contact.email}`
    },
    {
      icon: MapPin,
      title: 'Dirección',
      info: contact.address,
      link: contact.addressLink
    },
    {
      icon: Clock,
      title: contact.hoursLabel,
      info: contact.hours,
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
    const whatsappUrl = `https://wa.me/${contact.whatsappNumber}?text=${encodedMessage}`;
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
    <section id="contacto" data-scroll-section="true" className="py-20 bg-secondary scroll-mt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="mb-6 text-primary">{contact.title}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {contact.description}
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
                    {contact.schedule.map((row) => (
                      <div key={row.days} className="flex justify-between">
                        <span>{row.days}</span>
                        <span className="font-semibold">{row.hours}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-accent-foreground/80 mt-4">
                    {contact.emergencyNote}
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
