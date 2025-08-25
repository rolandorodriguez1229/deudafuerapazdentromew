import Link from 'next/link';
import { Mail, BookOpen, MessageCircle, FileText } from 'lucide-react';

export default function Footer() {
  const quickLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Sobre Mí', href: '/sobre-mi' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contacto', href: '/contacto' },
  ];

  const products = [
    { name: 'eBook Digital', href: '/comprar' },
    { name: 'Paquete Completo', href: '/comprar' },
    { name: 'Plantilla Gratuita', href: '/plantilla-gratuita' },
  ];

  const legal = [
    { name: 'Política de Privacidad', href: '/privacidad' },
    { name: 'Términos de Uso', href: '/terminos' },
    { name: 'Garantía', href: '/garantia' },
  ];

  return (
    <footer className="bg-primary-950 text-white">
      <div className="section-container py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <BookOpen className="h-8 w-8 text-accent-400" />
              <div>
                <div className="font-serif font-bold text-xl">
                  Deuda Fuera, Paz Dentro
                </div>
                <div className="text-xs text-blue-300">por Rolando Rodríguez</div>
              </div>
            </Link>
            <p className="text-blue-200 leading-relaxed mb-6">
              El sistema probado para eliminar deudas que ha ayudado a miles de 
              familias hispanas a recuperar su paz financiera.
            </p>
            <div className="flex items-center space-x-2 text-accent-400">
              <Mail className="h-4 w-4" />
              <span className="text-sm">contacto@deudafuerapazdentro.com</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Enlaces Rápidos</h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-blue-200 hover:text-accent-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Productos</h3>
            <ul className="space-y-4">
              {products.map((product) => (
                <li key={product.name}>
                  <Link
                    href={product.href}
                    className="text-blue-200 hover:text-accent-400 transition-colors duration-200"
                  >
                    {product.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Legal</h3>
            <ul className="space-y-4">
              {legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-blue-200 hover:text-accent-400 transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="border-t border-primary-800 mt-12 pt-12">
          <div className="bg-gradient-to-r from-primary-800 to-primary-900 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              ¿Listo para Recuperar tu Paz Financiera?
            </h3>
            <p className="text-blue-200 mb-6 max-w-2xl mx-auto">
              Descarga la plantilla gratuita y calcula tu IPD® en 15 minutos. 
              Es el primer paso hacia tu libertad financiera.
            </p>
            <Link
              href="/plantilla-gratuita"
              className="btn-primary inline-flex items-center"
            >
              <FileText className="mr-2 h-5 w-5" />
              Obtener Plantilla Gratuita
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-300 text-sm mb-4 md:mb-0">
            © 2024 Deuda Fuera, Paz Dentro. Todos los derechos reservados.
          </p>
          <div className="flex items-center space-x-6">
            <span className="text-blue-300 text-sm">Síguenos:</span>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-blue-300 hover:text-accent-400 transition-colors duration-200"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
              {/* Add more social icons as needed */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 