import Link from 'next/link';
import { Book, Headphones, MonitorPlay, CheckCircle } from 'lucide-react';
import { EBOOK_SALES_PAUSED, WAITLIST_CTA_LABEL, WAITLIST_PATH } from '@/config/sales';
import PriceX from './PriceX';

export default function ProductsSection() {
  const products = [
    {
      name: "eBook Digital",
      price: "$7.99",
      originalPrice: "$19.99",
      icon: <Book className="h-8 w-8 text-primary-600" />,
      description: "Oferta de lanzamiento: eBook + bonos incluidos",
      features: [
        "eBook completo en formato digital",
        "🎁 Plantilla IPD 360° (Valorada en $29.99)",
        "🎁 Checklist 30-60-90 días (Valorada en $19.99)",
        "🎁 Scripts para negociar con acreedores (Valorados en $24.99)",
        "Acceso inmediato",
        "Garantía 30 días"
      ],
      popular: true,
      comingSoon: false
    },
    {
      name: "Audiolibro",
      price: "",
      originalPrice: "",
      icon: <Headphones className="h-8 w-8 text-primary-600" />,
      description: "El método completo, narrado por el autor",
      features: [
        "Las 6 partes del libro en audio",
        "Se escucha dentro de la app, desde el móvil",
        "Avanza donde lo dejaste, en cualquier dispositivo"
      ],
      popular: false,
      comingSoon: true
    },
    {
      name: "Videocurso",
      price: "",
      originalPrice: "",
      icon: <MonitorPlay className="h-8 w-8 text-primary-600" />,
      description: "El Selector de Estrategia, paso a paso en pantalla",
      features: [
        "Cómo calcular tu IPD y leer tu fase",
        "Casos reales resueltos en vivo",
        "Guiones de negociación, con las llamadas comentadas"
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
            El eBook está listo hoy. El audiolibro y el videocurso llegan después.
            Los tres enseñan el mismo sistema con el que eliminé $90,000 en deudas.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 items-stretch">
          {products.map((product, index) => (
            <div key={index} className={`relative flex flex-col bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${product.popular ? 'ring-2 ring-accent-500' : 'border border-neutral-200'} w-full`}>
              {/* Popular badge removed per request */}
              
              {product.comingSoon && (
                <div className="absolute top-4 right-4">
                  <div className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full text-xs font-medium">
                    Próximamente
                  </div>
                </div>
              )}

              <div className="p-8 flex flex-col flex-1">
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

                {/* Price — sin precio todavía, el bloque entero se omite para no
                    dejar un hueco vacío del tamaño de una cifra */}
                {product.price && (
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-3xl font-bold text-neutral-900">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-lg text-neutral-400">
                          <PriceX text={product.originalPrice} />
                        </span>
                      )}
                    </div>
                    {product.originalPrice && (
                      <p className="text-sm text-green-600 font-medium">
                        Ahorra {parseInt(product.originalPrice.replace('$', '')) - parseInt(product.price.replace('$', ''))}$
                      </p>
                    )}
                  </div>
                )}

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

                {/* CTA Button — con la venta pausada, ningún camino del sitio
                    puede prometer una compra (ver config/sales.ts) */}
                <div className="text-center mt-auto">
                  {product.comingSoon ? (
                    <button
                      disabled
                      className="w-full bg-neutral-100 text-neutral-400 font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
                    >
                      Próximamente
                    </button>
                  ) : (
                    <Link
                      href={EBOOK_SALES_PAUSED ? WAITLIST_PATH : '/comprar'}
                      className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-300 block text-center ${
                        product.popular ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {EBOOK_SALES_PAUSED ? WAITLIST_CTA_LABEL : 'Comprar Ahora'}
                    </Link>
                  )}
                </div>
                {!product.comingSoon && (
                  <p className="text-xs text-neutral-500 text-center mt-3">Incluye garantía de 30 días</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        

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