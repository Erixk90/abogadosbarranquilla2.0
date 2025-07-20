import { Scale, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Scale className="h-8 w-8" />
                <span className="text-2xl font-bold">Estudio Jurídico</span>
              </div>
              <p className="text-primary-foreground/80 leading-relaxed mb-4">
                Más de 20 años brindando servicios legales de excelencia, 
                con compromiso, integridad y resultados excepcionales.
              </p>
              <p className="text-sm text-primary-foreground/60">
                {/*Aqui va lo del colegio de abogados cuando se tenga */}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                {[
                  { href: '#inicio', label: 'Inicio' },
                  { href: '#nosotros', label: 'Nosotros' },
                  { href: '#servicios', label: 'Servicios' },
                  { href: '#contacto', label: 'Contacto' },
                ].map((link) => (
                  <li key={link.href}>
                    <button
                      onClick={() => document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' })}
                      className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-300"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-primary-foreground/60" />
                  <a 
                    href="https://wa.me/573008471898?text=Hola,%20me%20gustaría%20contactar%20con%20el%20estudio%20jurídico"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-300"
                  >
                    +57 300 8471898 (WhatsApp)
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-primary-foreground/60" />
                  <a 
                    href="mailto:director@abogadosbq.com"
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-300"
                  >
                    director@abogadosbq.com
                  </a>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-primary-foreground/60 mt-1" />
                  <span className="text-primary-foreground/80">
                    080001 Barranquilla
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-primary-foreground/20 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-primary-foreground/60 text-sm">
                © {currentYear} Estudio Jurídico Abogados Barranquilla. Todos los derechos reservados.
              </p>
              <div className="flex space-x-6 text-sm">
                <button className="text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-300">
                  Política de Privacidad
                </button>
                <button className="text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-300">
                  Términos de Servicio
                </button>
                <button className="text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-300">
                  Aviso Legal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;