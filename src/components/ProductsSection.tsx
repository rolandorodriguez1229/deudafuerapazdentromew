import Link from 'next/link';
import { Book, Headphones, MessageCircle, CheckCircle, Star } from 'lucide-react';

export default function ProductsSection() {
  const products = [
    {
      name: "eBook Digital",
      price: "$19",
      originalPrice: "$29",
      icon: <Book className="h-8 w-8 text-primary-600" />,
      description: "El libro completo en formato digital",
      features: [
        "210 páginas de contenido práctico",
        "Sistema IPD® completo explicado",
        "Las 3 estrategias paso a paso",
        "Plantillas y hojas de trabajo",
        "Acceso inmediato tras la compra",
        "Compatible con todos los dispositivos"
      ],
      popular: false,
      comingSoon: false
    },
    {
      name: "Paquete Completo",
      price: "$47",
      originalPrice: "$97",
      icon: <Star className="h-8 w-8 text-accent-500" />,
      description: "Todo lo que necesitas para tu libertad financiera",
      features: [
        "eBook Digital completo",
        "Audiolibro narrado por Rolando",
        "Curso en video (5 horas)",
        "Plantillas avanzadas en Excel",
        "Guía de seguimiento mensual",
        "Bonos exclusivos ($200 valor)",
        "Soporte por email 90 días",
        "Garantía de 30 días"
      ],
      popular: true,
      comingSoon: false
    },
    {
      name: "Audiolibro",
      price: "Próximamente",
      originalPrice: "",
      icon: <Headphones className="h-8 w-8 text-neutral-400" />,
      description: "Escucha mientras manejas o haces ejercicio",
      features: [
        "Narrado por Rolando Rodríguez",
        "8 horas de contenido de audio",
        "Capítulos divididos por tema",
        "Disponible en todas las plataformas",
        "Descarga para escuchar sin internet",
        "Incluye material adicional"
      ],
      popular: false,
      comingSoon: true
    },
    {
      name: "Curso + Chatbot IA",
      price: "Próximamente",
      originalPrice: "",
      icon: <MessageCircle className="h-8 w-8 text-neutral-400" />,
      description: "Asesoría personalizada 24/7 con IA",
      features: [
        "Curso completo en video",
        "Chatbot entrenado por Rolando",
        "Respuestas personalizadas 24/7",
        "Seguimiento automático de progreso",
        "Alertas y recordatorios",
        "Comunidad privada de estudiantes"
      ],
      popular: false,
      comingSoon: true
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="section-container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-6">
            <Book className="h-4 w-4" />
            <span className="text-sm font-medium">Productos Disponibles</span>
          </div>
          
          <h2 className="heading-lg text-neutral-900 mb-6">
            Elige el Paquete que{' '}
            <span className="text-accent-500">Mejor se Adapte</span> a Ti
          </h2>
          
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Desde el eBook básico hasta el paquete completo con curso y chatbot IA. 
            Todos incluyen el mismo sistema probado que me ayudó a eliminar $90,000 en deudas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <div key={index} className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${product.popular ? 'ring-2 ring-accent-500' : 'border border-neutral-200'}`}>
              {product.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-accent-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    MÁS POPULAR
                  </div>
                </div>
              )}
              
              {product.comingSoon && (
                <div className="absolute top-4 right-4">
                  <div className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full text-xs font-medium">
                    Próximamente
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Icon & Name */}
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${product.popular ? 'bg-accent-50' : 'bg-neutral-50'}`}>
                    {product.icon}
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    {product.description}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-2">
                    <span className={`text-3xl font-bold ${product.comingSoon ? 'text-neutral-400' : 'text-neutral-900'}`}>
                      {product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-lg text-neutral-400 line-through">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>
                  {!product.comingSoon && product.originalPrice && (
                    <p className="text-sm text-green-600 font-medium">
                      Ahorra {parseInt(product.originalPrice.replace('$', '')) - parseInt(product.price.replace('$', ''))}$
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {product.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <CheckCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${product.comingSoon ? 'text-neutral-300' : 'text-green-500'}`} />
                      <span className={`text-sm ${product.comingSoon ? 'text-neutral-400' : 'text-neutral-700'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="text-center">
                  {product.comingSoon ? (
                    <button 
                      disabled 
                      className="w-full bg-neutral-100 text-neutral-400 font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
                    >
                      Próximamente
                    </button>
                  ) : (
                    <Link
                      href="/comprar"
                      className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-300 block text-center ${
                        product.popular 
                          ? 'btn-primary' 
                          : 'btn-secondary'
                      }`}
                    >
                      {product.name === "eBook Digital" ? "Comprar Ahora" : "Obtener Paquete"}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="heading-md text-neutral-900 mb-4">
              ¿No estás seguro cuál elegir?
            </h3>
            <p className="text-lg text-neutral-600 mb-6">
              Comienza con la plantilla gratuita y descubre cómo el sistema IPD® 
              puede cambiar tu situación financiera en solo 15 minutos.
            </p>
            <Link
              href="/plantilla-gratuita"
              className="btn-primary inline-flex items-center"
            >
              Obtener Diagnóstico Gratuito
            </Link>
          </div>
        </div>

        {/* Guarantee */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">
              Garantía de satisfacción de 30 días en todos los productos de pago
            </span>
          </div>
        </div>
      </div>
    </section>
  );
} 