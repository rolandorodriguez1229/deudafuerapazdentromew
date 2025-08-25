# Deuda Fuera, Paz Dentro - Sitio Web

Sitio web oficial para el libro "Deuda Fuera, Paz Dentro" por Rolando Rodríguez. Un sitio moderno desarrollado en Next.js enfocado en la venta del libro y productos relacionados.

## 🚀 Características

- **Diseño Moderno**: Interfaz limpia y profesional con colores azul profundo y acentos dorados
- **Totalmente Responsivo**: Optimizado para móviles, tablets y desktop
- **Páginas Incluidas**:
  - Homepage con todas las secciones requeridas
  - Landing page para captura de leads (plantilla gratuita)
  - Página de ventas para los productos
- **Optimizado para SEO**: Meta tags, estructura semántica y URLs amigables
- **Preparado para Expansión**: Estructura lista para audiolibro, curso y chatbot IA

## 🛠️ Tecnologías Utilizadas

- **Next.js 15** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **Lucide React** - Iconos modernos
- **Google Fonts** - Poppins y Playfair Display

## 📦 Instalación y Uso

### Prerrequisitos
- Node.js 18 o superior
- npm o yarn

### Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Ejecutar en modo desarrollo**:
```bash
npm run dev
```

3. **Abrir en el navegador**:
Visita [http://localhost:3000](http://localhost:3000)

### Comandos Disponibles

```bash
# Desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar versión de producción
npm start

# Verificar código
npm run lint
```

## 📱 Páginas y Funcionalidades

### Homepage (/)
- **Sección Hero**: Titular impactante y CTA principal
- **Problema**: Descripción del ciclo de deudas
- **Solución**: Presentación del sistema IPD®
- **Autor**: Historia personal de Rolando
- **Lead Magnet**: Plantilla de diagnóstico gratuita
- **Productos**: Paquetes disponibles

### Landing Page (/plantilla-gratuita)
- **Sin menú**: Para evitar distracciones
- **Formulario de captura**: Nombre y correo electrónico
- **Beneficios claros**: Lista de qué incluye la plantilla
- **Página de confirmación**: Mensaje de éxito tras el envío

### Página de Ventas (/comprar)
- **Dos productos principales**: eBook Digital y Paquete Completo
- **Precios y características**: Comparación clara de paquetes
- **Mensaje temporal**: Indicación de sitio en construcción

## 🎨 Sistema de Diseño

### Paleta de Colores
- **Primarios**: Azules profundos (#082f49 a #0c4a6e)
- **Acentos**: Dorados (#f59e0b)
- **Neutros**: Grises (#fafafa a #171717)

### Tipografías
- **Sans-serif**: Poppins (cuerpo de texto)
- **Serif**: Playfair Display (títulos)

### Componentes Reutilizables
- **Botones**: `.btn-primary`, `.btn-secondary`
- **Contenedores**: `.section-container`
- **Títulos**: `.heading-xl`, `.heading-lg`, `.heading-md`

## 🔧 Configuración y Personalización

### Email Marketing
Para conectar los formularios a tu servicio de email marketing:

1. **Edita el formulario** en `/src/app/plantilla-gratuita/page.tsx`
2. **Reemplaza la simulación** con tu API endpoint
3. **Servicios recomendados**: MailerLite, ConvertKit, ActiveCampaign

### Plataforma de Pagos
Para conectar los botones de compra:

1. **Edita la página** `/src/app/comprar/page.tsx`
2. **Reemplaza los botones** con enlaces a tu plataforma
3. **Opciones recomendadas**: Gumroad, Lemon Squeezy, Stripe

### Analytics
Para añadir Google Analytics:

1. **Instala** `@next/third-parties`
2. **Configura** en `layout.tsx`
3. **Añade tu ID** de Google Analytics

## 🚀 Deploy a Producción

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Deploy automático en cada push
3. SSL y CDN incluidos

### Netlify
1. Conecta tu repositorio a Netlify
2. Configura build command: `npm run build`
3. Publish directory: `out`

### Otros Hosts
```bash
npm run build
npm start
```

## 📈 Próximas Funcionalidades

### Expansiones Planificadas
- [ ] **Blog**: Sistema de contenidos con categorías
- [ ] **Página "Sobre Mí"**: Historia completa del autor
- [ ] **Página de Contacto**: Formulario de contacto
- [ ] **Página de Ventas Extendida**: Copy persuasivo completo
- [ ] **Integración de Audiolibro**: Cuando esté disponible
- [ ] **Curso en Video**: Plataforma de aprendizaje
- [ ] **Chatbot IA**: Asistente virtual personalizado

### Optimizaciones Técnicas
- [ ] **Imágenes**: Optimización con next/image
- [ ] **Fonts**: Optimización de carga
- [ ] **Performance**: Lazy loading y code splitting
- [ ] **SEO**: Sitemap y meta tags avanzados

## 🤝 Soporte

Para soporte técnico o personalizaciones:
- Email: contacto@deudafuerapazdentro.com
- Documentación: [Next.js Docs](https://nextjs.org/docs)
- Tailwind CSS: [Documentación](https://tailwindcss.com/docs)

## 📄 Licencia

Este proyecto es propiedad de Rolando Rodríguez. Todos los derechos reservados.

---

**¡Tu sitio web está listo para ayudar a miles de familias a recuperar su paz financiera!** 🎉
