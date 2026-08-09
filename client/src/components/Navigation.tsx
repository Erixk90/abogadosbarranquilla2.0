import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const topTextClass = isScrolled ? 'text-foreground' : 'text-white';
  const topHoverClass = isScrolled ? 'hover:text-primary' : 'hover:text-white/90';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { to: '/#inicio', label: 'Inicio' },
    { to: '/#nosotros', label: 'Nosotros' },
    { to: '/#servicios', label: 'Servicios' },
    { to: '/noticias', label: 'Noticias' },
    { to: '/#contacto', label: 'Contacto' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-sm shadow-professional' 
          : 'bg-black/20 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between ">
          {/* Logo */}
          <div className="brand-shell text-2xl font-bold flex items-center gap-2">
            <img
            src="/LogoAbogadosbqbn.jpg"
            alt="Abogados Barranquilla"
            className="brand-mark w-6 h-6 object-contain rounded"
    />
            <span className={`brand-title ${topTextClass}`}>
              Abogados Barranquilla
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`transition-colors duration-300 font-medium ${location.pathname === '/noticias' && item.to === '/noticias' ? 'text-primary' : `${topTextClass} ${topHoverClass}`}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`md:hidden ${topTextClass} hover:bg-white/10 hover:text-white`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={`text-left transition-colors duration-300 font-medium py-2 ${topTextClass} ${topHoverClass}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
