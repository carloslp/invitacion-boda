import { useEffect, useState } from 'react';
import { Heart, Calendar, Clock, ChevronLeft, ChevronRight, Shirt } from 'lucide-react';

function App() {
  // Genera pétalos animados
  // Estado para número de acompañantes
  // companions: número de acompañantes (no incluye al invitado principal)
  const [companions, setCompanions] = useState<number>(0);
  // opcionesInvitados: array de opciones permitidas (total de invitados, incluyendo al principal)
  const [opcionesInvitados, setOpcionesInvitados] = useState<number[]>([1]);
  const [guestName, setGuestName] = useState<string>('nuestro invitado especial');
  const [guestBase64, setGuestBase64] = useState<string>('');
  const [confirmationStatus, setConfirmationStatus] = useState<'none' | 'confirmed' | 'already-confirmed' | 'declined' | 'already-declined' | 'error'>('none');
  // Fecha de la boda: 19 de octubre de 2025, 20:00 hora local
  const weddingDate = new Date('2025-11-15T20:00:00');
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    finished: false,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = weddingDate.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, finished: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown({ days, hours, minutes, seconds, finished: false });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []); // Solo ejecuta una vez al montar
  const [isConfirming, setIsConfirming] = useState(false);
  
  // Estado del carrusel estilo Instagram Stories
  // Índice de la imagen actual que se está mostrando en el carrusel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Posición inicial del toque en el eje X (en píxeles) para detectar gestos de deslizamiento
  const [touchStart, setTouchStart] = useState<number | null>(null);
  // Posición final del toque en el eje X (en píxeles) para calcular la dirección del deslizamiento
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Distancia mínima de deslizamiento (en píxeles) necesaria para cambiar de imagen
  // Previene cambios accidentales por toques pequeños o involuntarios
  const minSwipeDistance = 50;

  // Imágenes del carrusel - Actualmente usa fotos de ejemplo de Unsplash
  // TODO: Reemplazar con fotos reales de la boda
  // Las imágenes del carrusel ahora se toman de la carpeta /public/carousel
  // Ejemplo: carousel1.webp, carousel2.webp, carousel3.webp...
  const carouselImages = [
    '/carousel/01.webp',
    '/carousel/02.webp',
    '/carousel/03.webp',
    '/carousel/04.webp',
    '/carousel/07.webp',
    '/carousel/08.webp',
    '/carousel/09.webp',
    '/carousel/10.webp',
    '/carousel/11.webp',
    '/carousel/12.webp',
    '/carousel/13.webp',
    '/carousel/14.webp',
    '/carousel/15.webp',
    '/carousel/16.webp',
    '/carousel/17.webp',
    '/carousel/18.webp',
    '/carousel/19.webp',
    '/carousel/20.webp',
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invitadoBase64 = params.get('invitado');

    if (invitadoBase64) {
      setGuestBase64(invitadoBase64);
      // Decodifica el base64 y separa por '|'
      try {
        const decoded = atob(invitadoBase64);
        const [nombre, invitadosStr] = decoded.split('|');
        setGuestName(nombre || 'nuestro invitado especial');
        if (invitadosStr) {
          // Si viene una lista separada por coma, ej: "1,2,3"
          if (invitadosStr.includes(',')) {
            const opciones = invitadosStr.split(',').map(v => Number(v)).filter(v => !isNaN(v) && v > 0);
            if (opciones.length > 0) {
              setOpcionesInvitados(opciones);
              setCompanions(opciones[0] - 1); // Por defecto selecciona la primera opción
            } else {
              setOpcionesInvitados([1]);
              setCompanions(0);
            }
          } else {
            // Si viene como un solo número, ej: "2"
            const max = Number(invitadosStr);
            if (!isNaN(max) && max > 0) {
              const opciones = Array.from({ length: max }, (_, i) => i + 1);
              setOpcionesInvitados(opciones);
              setCompanions(max - 1); // Por defecto selecciona el máximo
            } else {
              setOpcionesInvitados([1]);
              setCompanions(0);
            }
          }
        } else {
          setOpcionesInvitados([1]);
          setCompanions(0);
        }
      } catch (error) {
        setGuestName('nuestro invitado especial');
        setOpcionesInvitados([1]);
        setCompanions(0);
      }
    }
  }, []);

  // Efecto para avanzar automáticamente el carrusel
  // Cambia a la siguiente imagen cada 4 segundos de forma automática
  // Similar al comportamiento de Instagram Stories
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []); // Solo ejecuta una vez al montar

  const fetchGuestName = async (base64: string) => {
    try {
      // Decode base64 to get guest name(s)
      const decoded = atob(base64);
      setGuestName(decoded);
    } catch (error) {
      console.error('Error decoding base64:', error);
      setGuestName('nuestro invitado especial');
    }
  };

  const handleConfirmation = async (willAttend: boolean) => {
    if (!guestBase64 || isConfirming) return;

    setIsConfirming(true);
    try {
      // Incluye el número de invitados (acompañantes + 1)
      const totalInvitados = willAttend ? companions + 1 : 0;
      const apiUrl = `https://n8n.paas.oracle-mty1.juanlopez.dev/webhook/boda?invitado=${guestBase64}&confirmacion=${willAttend ? 'si' : 'no'}&invitados=${totalInvitados}`;
      const response = await fetch(apiUrl, { method: 'GET' });

      if (response.status === 200) {
        setConfirmationStatus(willAttend ? 'confirmed' : 'declined');
      } else {
        setConfirmationStatus('error');
      }
    } catch (error) {
      console.error('Error confirming:', error);
      setConfirmationStatus('error');
    } finally {
      setIsConfirming(false);
    }
  };

  // Funciones de navegación del carrusel

  /**
   * Avanza a la siguiente imagen del carrusel
   * Usa módulo para volver al inicio cuando llega al final
   */
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  /**
   * Retrocede a la imagen anterior del carrusel
   * Suma la longitud del array antes de aplicar módulo para evitar números negativos
   */
  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  // Manejadores de eventos táctiles para navegación por gestos (swipe)
  // Implementa el comportamiento de deslizamiento estilo Instagram Stories

  /**
   * Captura la posición inicial cuando el usuario toca la pantalla
   * Resetea touchEnd para preparar un nuevo gesto
   */
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  /**
   * Actualiza continuamente la posición mientras el usuario desliza el dedo
   * Permite calcular la dirección y distancia del deslizamiento
   */
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  /**
   * Se ejecuta cuando el usuario levanta el dedo de la pantalla
   * Calcula la dirección del deslizamiento y navega si supera la distancia mínima
   */
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    // Calcula la distancia del deslizamiento (positivo = izquierda, negativo = derecha)
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    // Deslizar izquierda = siguiente imagen
    if (isLeftSwipe) {
      nextImage();
    }
    // Deslizar derecha = imagen anterior
    if (isRightSwipe) {
      previousImage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex flex-col relative overflow-hidden">
      {/* Imágenes decorativas de imgur */}
      <img src="https://i.imgur.com/dGOOfnA.png" alt="image-top-right" className="fixed top-0 right-0 w-40 md:w-64 z-10 pointer-events-none select-none" style={{maxWidth:'30vw'}} />
      <img src="https://i.imgur.com/t6ffnbn.png" alt="image-top-left" className="fixed top-0 left-0 w-40 md:w-64 z-10 pointer-events-none select-none" style={{maxWidth:'30vw'}} />
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTAgMTBhNSA1IDAgMCAxIDUgNXY3MGE1IDUgMCAwIDEtNSA1IDUgNSAwIDAgMS01LTVWMTVhNSA1IDAgMCAxIDUtNXoiIGZpbGw9IiNmZjliYjAiLz48L3N2Zz4=')]"></div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="w-full max-w-4xl px-4 py-8 md:py-12">

          <div className="text-center mb-16 space-y-6">
            <div className="inline-block">
              <div className="w-24 h-24 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-300 to-blue-400 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-white rounded-full w-full h-full flex items-center justify-center shadow-lg">
                  <Heart className="w-12 h-12 text-indigo-400 fill-indigo-400" />
                </div>
              </div>
            </div>

            <h1 className="font-serif text-4xl md:text-6xl font-light text-gray-800 tracking-wide">
              Las verdaderas historias de amor nunca tienen un final
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-light italic">
              Juan & Wendy
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent mx-auto" />
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 mb-8 border border-indigo-100" id="invitation-content">
            {/* Sección Google Maps */}

            {/* Sección Dresscode destacada */}

            <div className="text-center mb-12">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                A veces, lo que empieza como una locura se convierte en lo mejor de tu vida.
                <br />
                <span className="text-indigo-600 font-semibold">¡Sé testigo de nuestro día especial!</span>
              </p>
            </div>

            <div className="border-t border-b border-indigo-200 py-8 my-8">
              <p className="text-center text-gray-700 text-lg leading-relaxed">
                Porque el amor merece ser celebrado, nos llena de alegría invitarte,{' '}
                <span className="font-semibold text-indigo-600 text-xl">{guestName}</span>, a celebrar el inicio de nuestro 'Matrimonio Feliz'.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="mt-1 bg-indigo-100 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 text-lg">Fecha de la Ceremonia</h3>
                    <p className="text-gray-600">15 de Noviembre, 2025</p>
                  </div>
                </div>

              </div>

              <div className="space-y-6">

                <div className="flex items-start space-x-4">
                  <div className="mt-1 bg-indigo-100 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 text-lg">Hora</h3>
                    <p className="text-gray-600">6 PM</p>
                  </div>
                </div>

              </div>
            </div>

            <div className="mb-10 flex flex-col items-center border-t border-b border-indigo-200 py-8 my-8">
              <div className="flex items-center gap-3 mb-2">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" /></svg>
                <span className="text-2xl font-semibold text-gray-800">Ubicación</span>
              </div>
              <div className="w-full flex flex-col items-center">
                <div className="rounded-xl overflow-hidden border border-indigo-200 shadow-lg max-w-xl w-full">
                  <iframe
                    title="Ubicación del evento"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d584.6036012840692!2d-108.4572463858065!3d25.56070520625849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86bbbfbdb41cb757%3A0x41485fad5b708134!2sEM%20eventos!5e1!3m2!1ses-419!2smx!4v1760939624219!5m2!1ses-419!2smx"
                    width="100%"
                    height="320"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                {/*               <span className="block mt-2 text-gray-600 text-base">Salón Jardín de los Sueños, CDMX</span>
 */}            </div>
            </div>
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-8 mb-12 border border-indigo-200">
              <h2 className="font-serif text-2xl md:text-3xl text-center text-gray-800 mb-4">Nuestra Historia</h2>
              <p className="text-center text-gray-700 leading-relaxed italic">
                "Nuestra historia, como un delicado haiku, se ha tejido con hilos de comprensión y paciencia.
                Hemos encontrado en el otro un refugio y un futuro juntos."
              </p>
            </div>
            {/* Slider integrado en la invitación, adaptado al alto de pantalla */}
            <div className="mb-10 flex flex-col items-center">
              <h2 className="font-serif text-3xl md:text-4xl text-center text-gray-800 mb-6 tracking-wide">
                Recuerdos de nuestro amor
              </h2>
              <div className="relative w-full max-w-md" style={{ height: 'min(70vh, 600px)' }}>
                {/* Barras de progreso estilo Stories */}
                <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
                  {carouselImages.map((_, index) => (
                    <div
                      key={index}
                      className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                    >
                      <div
                        className={`h-full bg-white transition-all duration-300 ${index === currentImageIndex ? 'w-full animate-progress' : index < currentImageIndex ? 'w-full' : 'w-0'
                          }`}
                      />
                    </div>
                  ))}
                </div>
                <div
                  className="relative overflow-hidden rounded-3xl shadow-2xl bg-gray-800 h-full"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <div className="relative w-full h-full">
                    {carouselImages.map((image, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentImageIndex
                          ? 'opacity-100 scale-100'
                          : index < currentImageIndex
                            ? 'opacity-0 scale-95 -translate-x-full'
                            : 'opacity-0 scale-95 translate-x-full'
                          }`}
                      >
                        <img
                          src={image}
                          alt={`Wedding photo ${index + 1}`}
                          className="w-full h-full object-cover"
                          style={{ height: '100%', width: '100%' }}
                        />
                      </div>
                    ))}
                  </div>
                  {/* Flechas de navegación */}
                  <button
                    onClick={previousImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-300 opacity-0 hover:opacity-100 group-hover:opacity-100"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-300 opacity-0 hover:opacity-100 group-hover:opacity-100"
                    aria-label="Siguiente imagen"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  {/* Indicadores de posición (dots) */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {carouselImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                          }`}
                        aria-label={`Ir a imagen ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-10 flex flex-col items-center">
              <div className="flex items-center gap-3 mb-2">
                <Shirt className="w-8 h-8 text-indigo-600" />
                <span className="text-2xl font-semibold text-gray-800">Dresscode</span>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-6 py-4 text-center max-w-md">
                <span className="block text-lg text-indigo-700 font-medium">Semi-formal / Casual</span>
                <span className="block text-gray-600 mt-2">Mujeres: vestido corto, falda o pantalón elegante. Hombres: camisa, pantalón de vestir o casual, opcional saco. No es necesario corbata ni vestido largo. No blanco.</span>
              </div>
            </div>
            {/* Aquí va el resto del contenido de la invitación, dentro del mismo div raíz */}
            {/* ...existing code... */}
            {/* ...existing code... */}
            {/* Contador regresivo para la fecha de la boda - justo arriba de los botones */}
            <div className="flex flex-col items-center pb-6">
              <div className="inline-flex items-center space-x-4 bg-indigo-50 text-indigo-700 px-8 py-4 rounded-full text-lg font-semibold shadow-md" style={{ marginBottom: '8px' }}>
                <Calendar className="w-5 h-5" />
                <span>
                  Faltan&nbsp;
                  <span className="font-mono">
                    {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                  </span>
                  &nbsp;para la boda
                </span>
              </div>
              {countdown.finished && (
                <div className="mt-2 text-red-600 font-bold">¡Ya comenzó la boda!</div>
              )}
            </div>
            <div className="text-center">
              {!countdown.finished && (
                confirmationStatus === 'confirmed' ? (
                  <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-8 py-4 rounded-full text-lg font-semibold">
                    <Heart className="w-5 h-5 fill-green-700" />
                    <span>¡Invitación confirmada!</span>
                  </div>
                ) : confirmationStatus === 'already-confirmed' ? (
                  <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-700 px-8 py-4 rounded-full text-lg font-semibold">
                    <Heart className="w-5 h-5 fill-yellow-700" />
                    <span>Ya habías confirmado la invitación</span>
                  </div>
                ) : confirmationStatus === 'declined' ? (
                  <div className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold">
                    <Heart className="w-5 h-5" />
                    <span>Lamentamos que no puedas asistir</span>
                  </div>
                ) : confirmationStatus === 'already-declined' ? (
                  <div className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold">
                    <Heart className="w-5 h-5" />
                    <span>Ya habías indicado que no podías asistir</span>
                  </div>
                ) : confirmationStatus === 'error' ? (
                  <div className="space-y-4">
                    <div className="inline-flex items-center space-x-2 bg-red-100 text-red-700 px-8 py-4 rounded-full text-lg font-semibold">
                      <span>Error al confirmar. Intenta nuevamente.</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => handleConfirmation(true)}
                        disabled={isConfirming || !guestBase64}
                        className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-12 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isConfirming ? 'Confirmando...' : 'Reintentar Confirmar'}
                      </button>
                      <button
                        onClick={() => handleConfirmation(false)}
                        disabled={isConfirming || !guestBase64}
                        className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-12 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isConfirming ? 'Enviando...' : 'Reintentar Declinar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Selector de acompañantes solo si va a confirmar asistencia */}
                    <div className="mb-6 flex flex-col items-center">
                      <span className="block mb-2 text-lg text-gray-700 font-semibold">¿Cuántos asistirán contigo? <span className="text-sm font-normal text-gray-500">(incluyéndote a ti)</span></span>
                      <div className="flex flex-row gap-4 justify-center">
                        {opcionesInvitados.map((total) => (
                          <label key={total} className="inline-flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="companions"
                              value={total}
                              checked={companions + 1 === total}
                              onChange={() => setCompanions(total - 1)}
                              className="form-radio h-5 w-5 text-indigo-600 focus:ring-indigo-400"
                            />
                            <span className="ml-2 text-base text-gray-700">
                              {total === 1 ? 'Solo yo' : `${total - 1} Acompañante y Yo`}
                            </span>
                          </label>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 mt-2">Total de invitados: {companions + 1}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => handleConfirmation(true)}
                        disabled={isConfirming || !guestBase64}
                        className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-12 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isConfirming ? 'Confirmando...' : 'Confirmar Asistencia'}
                      </button>
                      <button
                        onClick={() => handleConfirmation(false)}
                        disabled={isConfirming || !guestBase64}
                        className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-12 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isConfirming ? 'Enviando...' : 'No gracias, no podré asistir'}
                      </button>
                    </div>
                    {/* Leyenda No niños */}
                    <div className="mt-4 text-center text-red-500 font-semibold text-base">No niños.</div>
                  </>
                )
              )}

            </div>
          </div>

          <div className="text-center text-gray-500 text-sm">
            <p className="font-light">Con todo nuestro amor y gratitud</p>
          </div>
        </div> {/* cierre de w-full max-w-4xl px-4 py-8 md:py-12 */}
      </div> {/* cierre de flex-1 flex flex-col justify-center items-center */}
    </div>
  );
}

export default App;
