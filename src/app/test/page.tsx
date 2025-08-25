export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">
          Prueba de Tailwind CSS
        </h1>
        <p className="text-gray-600 mb-6">
          Si ves este texto con estilos, Tailwind está funcionando.
        </p>
        <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          Botón de Prueba
        </button>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-red-500 h-16 rounded"></div>
          <div className="bg-green-500 h-16 rounded"></div>
          <div className="bg-blue-500 h-16 rounded"></div>
        </div>
      </div>
    </div>
  );
} 