import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, TrendingUp, CheckCircle } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative bg-hero-pattern text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-yellow-500 bg-opacity-20 border border-yellow-400 rounded-full px-4 py-2">
              <Shield className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-100 text-sm font-medium">
                Sistema Probado y Confiable
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white text-balance">
              Deja de Trabajar para los{' '}
              <span className="text-yellow-400">Bancos</span>.{' '}
              Recupera tu Dinero y tu{' '}
              <span className="text-yellow-400">Paz</span>{' '}
              con un Plan que Sí Funciona
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-white/90 leading-relaxed max-w-2xl">
              El mismo sistema que me ayudó a eliminar{' '}
                              <span className="text-yellow-400 font-semibold">$90,000 en deudas</span>{' '}
              ahora puede ser tuyo. Sin trucos, sin fórmulas mágicas, solo un plan 
              paso a paso que funciona aunque sientas que no te alcanza el dinero.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 py-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-400">$90K</div>
                <div className="text-sm text-white/80">Deudas Eliminadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-400">100%</div>
                <div className="text-sm text-white/80">Método Probado</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-400">15 min</div>
                <div className="text-sm text-white/80">Para Empezar</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/plantilla-gratuita"
                className="btn-urgent transform hover:scale-105 inline-flex items-center justify-center group"
              >
                Obtén tu Diagnóstico Gratuito
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/comprar"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold py-4 px-8 rounded-lg transition-all duration-300"
              >
                Ver el Libro Completo
              </Link>
            </div>

            {/* Conversion bullets */}
            <div className="grid sm:grid-cols-3 gap-4 pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white/90 text-sm">Plan claro en 15 minutos</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white/90 text-sm">Ahorra intereses desde el mes 1</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white/90 text-sm">Garantía 30 días sin riesgo</span>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center space-x-4 pt-4">
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-accent-400" />
                <span className="text-sm text-white/80">Miles de personas ya recuperaron su paz financiera</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Book Cover */}
          <div className="relative">
            <div className="relative z-10 bg-gradient-to-br from-white to-neutral-100 rounded-2xl shadow-2xl p-3 sm:p-4 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <Image
                  src="/images/Deuda Fuera Paz Dentro Portada Ebook.png"
                  alt="Portada del libro Deuda Fuera, Paz Dentro"
                  width={640}
                  height={800}
                  priority
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-neutral-700 font-medium">por Rolando Rodríguez</p>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-accent-400 bg-opacity-20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-primary-400 bg-opacity-20 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
} 