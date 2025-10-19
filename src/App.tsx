import { useEffect, useState } from 'react';
import { Heart, MapPin, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

function App() {
  const [guestName, setGuestName] = useState<string>('nuestro invitado especial');
  const [guestBase64, setGuestBase64] = useState<string>('');
  const [confirmationStatus, setConfirmationStatus] = useState<'none' | 'confirmed' | 'already-confirmed' | 'declined' | 'already-declined' | 'error'>('none');
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
  const carouselImages = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=1067&fit=crop',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=1067&fit=crop',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=1067&fit=crop',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=1067&fit=crop',
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invitadoBase64 = params.get('invitado');

    if (invitadoBase64) {
      setGuestBase64(invitadoBase64);
      fetchGuestName(invitadoBase64);
    }
  }, []);

  // Efecto para avanzar automáticamente el carrusel
  // Cambia a la siguiente imagen cada 4 segundos de forma automática
  // Similar al comportamiento de Instagram Stories
  useEffect(() => {
    const interval = setInterval(() => {
      // Usa módulo para volver al inicio cuando llega al final
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000); // Cambiar imagen cada 4 segundos

    // Limpia el intervalo cuando el componente se desmonta
    return () => clearInterval(interval);
  }, [carouselImages.length]);

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
      const apiUrl = `https://n8n.paas.oracle-mty1.juanlopez.dev/webhook-test/boda?invitado=${guestBase64}&confirmacion=${willAttend ? 'si' : 'no'}`;
      const response = await fetch(apiUrl, { method: 'GET' });
      
      if (response.status === 200) {
        setConfirmationStatus(willAttend ? 'confirmed' : 'declined');
      } else if (response.status === 301) {
        setConfirmationStatus(willAttend ? 'already-confirmed' : 'already-declined');
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTAgMTBhNSA1IDAgMCAxIDUgNXY3MGE1IDUgMCAwIDEtNSA1IDUgNSAwIDAgMS01LTVWMTVhNSA1IDAgMCAxIDUtNXoiIGZpbGw9IiNmZjliYjAiLz48L3N2Zz4=')]" />

      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        {/* Carrusel estilo Instagram Stories */}
        {/* Este componente replica el comportamiento de Instagram Stories con: */}
        {/* - Barras de progreso en la parte superior */}
        {/* - Navegación por gestos táctiles (swipe) */}
        {/* - Navegación por flechas (en hover para desktop) */}
        {/* - Indicadores de página en la parte inferior */}
        {/* - Transiciones suaves entre imágenes */}
        {/* - Avance automático cada 4 segundos */}
        <div className="mb-16">
          <div className="relative w-full">
            {/* Barras de progreso estilo Stories */}
            {/* Muestra el progreso de visualización de cada imagen */}
            {/* Similar a las barras en la parte superior de Instagram Stories */}
            <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
              {carouselImages.map((_, index) => (
                <div
                  key={index}
                  className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                >
                  <div
                    className={`h-full bg-white transition-all duration-300 ${
                      // Imagen actual: barra completa con animación
                      // Imágenes pasadas: barra completa
                      // Imágenes futuras: barra vacía
                      index === currentImageIndex ? 'w-full animate-progress' : index < currentImageIndex ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Contenedor del carrusel */}
            {/* Formato vertical 9:16 similar a Stories de Instagram */}
            {/* Los eventos táctiles permiten navegación por gestos de deslizamiento */}
            <div 
              className="relative overflow-hidden rounded-3xl shadow-2xl"
              style={{ aspectRatio: '9/16' }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Contenedor de imágenes con animaciones */}
              {/* Cada imagen se posiciona absolutamente y se anima al cambiar */}
              <div className="relative w-full h-full">
                {carouselImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      index === currentImageIndex
                        ? 'opacity-100 scale-100' // Imagen actual: visible y tamaño normal
                        : index < currentImageIndex
                        ? 'opacity-0 scale-95 -translate-x-full' // Imágenes pasadas: deslizada a la izquierda
                        : 'opacity-0 scale-95 translate-x-full' // Imágenes futuras: deslizada a la derecha
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Wedding photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Flechas de navegación */}
              {/* Visibles solo en hover (principalmente para desktop) */}
              {/* En móviles, los usuarios usarán gestos de deslizamiento */}
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
              {/* Puntos en la parte inferior que indican qué imagen se está viendo */}
              {/* También funcionan como botones para navegar directamente a una imagen */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      // El indicador activo es más ancho y completamente blanco
                      index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                    }`}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

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
            ¡Nuestra Felicidad Comienza Aquí!
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light italic">
            Un Compromiso Inquebrantable
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent mx-auto" />
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 mb-8 border border-indigo-100">
          <div className="text-center mb-12">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              Como Miyo y Kiyoka, nuestro amor florece contra todo pronóstico.
              <br />
              <span className="text-indigo-600 font-semibold">¡Sé testigo de nuestro día especial!</span>
            </p>
          </div>

          <div className="border-t border-b border-indigo-200 py-8 my-8">
            <p className="text-center text-gray-700 text-lg leading-relaxed">
              Con la pureza de un corazón que busca su verdadero hogar, nos llena de alegría invitarte,{' '}
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
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">Día de la Ceremonia</h3>
                  <p className="text-gray-600">[Fecha]</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-indigo-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">Hora</h3>
                  <p className="text-gray-600">[Hora]</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-indigo-100 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">Ubicación Sagrada</h3>
                  <p className="text-gray-600">[Nombre del Lugar]</p>
                  <p className="text-gray-500 text-sm">[Dirección]</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-indigo-100 p-3 rounded-lg">
                  <Heart className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">Celebración del Vínculo</h3>
                  <p className="text-gray-600">[Nombre del Lugar de la Recepción]</p>
                  <p className="text-gray-500 text-sm">[Dirección]</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-8 mb-12 border border-indigo-200">
            <h2 className="font-serif text-2xl md:text-3xl text-center text-gray-800 mb-4">Nuestra Historia</h2>
            <p className="text-center text-gray-700 leading-relaxed italic">
              "Nuestra historia, como un delicado haiku, se ha tejido con hilos de comprensión y paciencia.
              Hemos encontrado en el otro un refugio y un futuro juntos."
            </p>
          </div>

          <div className="text-center">
            {confirmationStatus === 'confirmed' ? (
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
            )}
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm">
          <p className="font-light">Con todo nuestro amor y gratitud</p>
        </div>
      </div>
    </div>
  );
}

export default App;
