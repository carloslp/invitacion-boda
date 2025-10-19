import { useEffect, useState } from 'react';
import { Heart, MapPin, Calendar, Clock } from 'lucide-react';

function App() {
  const [guestName, setGuestName] = useState<string>('nuestro invitado especial');
  const [guestHash, setGuestHash] = useState<string>('');
  const [confirmed, setConfirmed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invitadoHash = params.get('invitado');

    if (invitadoHash) {
      setGuestHash(invitadoHash);
      fetchGuestName(invitadoHash);
    }
  }, []);

  const fetchGuestName = async (hash: string) => {
    setGuestName('nuestro invitado especial');
  };

  const handleConfirmation = async () => {
    if (!guestHash || isConfirming) return;

    setIsConfirming(true);
    try {
      const apiUrl = `https://api.confirmacionboda.com/confirmar?invitado=${guestHash}`;
      await fetch(apiUrl, { method: 'GET' });
      setConfirmed(true);
    } catch (error) {
      console.error('Error confirming:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTAgMTBhNSA1IDAgMCAxIDUgNXY3MGE1IDUgMCAwIDEtNSA1IDUgNSAwIDAgMS01LTVWMTVhNSA1IDAgMCAxIDUtNXoiIGZpbGw9IiNmZjliYjAiLz48L3N2Zz4=')]" />

      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
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
            {confirmed ? (
              <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-8 py-4 rounded-full text-lg font-semibold">
                <Heart className="w-5 h-5 fill-green-700" />
                <span>¡Gracias por confirmar!</span>
              </div>
            ) : (
              <button
                onClick={handleConfirmation}
                disabled={isConfirming || !guestHash}
                className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-12 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isConfirming ? 'Confirmando...' : 'Confirmar Asistencia'}
              </button>
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
