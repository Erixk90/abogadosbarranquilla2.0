import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Número de WhatsApp del bufete (cambiar por el número real)
  const whatsappNumber = "573001477860"; // Formato internacional sin +
  
  const openWhatsApp = (message?: string) => {
    const defaultMessage = "Hola, me gustaría solicitar una consulta legal gratuita.";
    const encodedMessage = encodeURIComponent(message || defaultMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const quickMessages = [
    "Necesito consulta sobre derecho corporativo",
    "Tengo una consulta sobre derecho familiar",
    "Requiero asesoría en derecho civil",
    "Necesito ayuda con temas inmobiliarios",
    "Tengo un problema laboral",
    "Necesito defensa penal"
  ];

  return (
    <>
      {/* Widget Principal */}
      <div className="fixed bottom-6 right-6 z-50">
        {isOpen && (
          <div className="bg-card shadow-elegant rounded-lg p-4 mb-4 w-80 max-w-[calc(100vw-3rem)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Estudio Jurídico</h4>
                  <p className="text-sm text-green-600 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    En línea
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              ¡Hola! 👋 ¿En qué podemos ayudarle hoy? Seleccione una opción o escriba su consulta:
            </p>
            
            <div className="space-y-2 mb-4">
              {quickMessages.map((message, index) => (
                <button
                  key={index}
                  onClick={() => openWhatsApp(message)}
                  className="w-full text-left p-2 text-sm bg-muted hover:bg-accent rounded transition-colors duration-200"
                >
                  {message}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => openWhatsApp()}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded font-medium transition-colors duration-200"
            >
              Abrir WhatsApp
            </button>
          </div>
        )}
        
        {/* Botón flotante */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full shadow-elegant flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Overlay para cerrar en mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default WhatsAppWidget;