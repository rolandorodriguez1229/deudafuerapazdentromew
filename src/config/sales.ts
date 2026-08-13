/**
 * Interruptor de venta del eBook.
 *
 * Con `EBOOK_SALES_PAUSED` en `true`, NINGÚN camino del sitio puede llegar a un
 * cobro: los dos handlers de checkout desvían a la lista de espera antes de
 * tocar Stripe, y los CTA apuntan ahí en vez de a `/checkout`. La guarda del
 * servidor es la que manda — los CTA son solo para que el usuario no choque
 * contra una redirección.
 *
 * Por qué está apagado: lo que el webhook entrega hoy al comprador es
 * `/downloads/guia-estrategias.pdf`, un placeholder de 946 bytes que además es
 * el mismo archivo que se regala en `/plantilla-gratuita`. No existe todavía el
 * EPUB del manuscrito v3.7.
 *
 * ANTES DE PONER ESTO EN `false`, revisar los tres caminos que hoy siguen
 * apuntando a placeholders. Están dormidos porque no se puede comprar, y se
 * despiertan solos en cuanto se reactive el cobro:
 *
 *   1. `src/app/api/stripe/webhook/route.ts` — el correo de compra enlaza
 *      `/downloads/guia-estrategias.pdf` (946 bytes) y `scripts-negociacion.pdf`
 *      (482 bytes, dice "placeholder"). Tiene que entregar el EPUB real con
 *      enlaces firmados que caduquen, no archivos en `/public`.
 *   2. `src/app/gracias/page.tsx` — los mismos dos archivos, como descarga
 *      directa después de pagar.
 *   3. `/public/downloads/` — mientras esos archivos existan ahí, cualquiera
 *      los baja sin pagar. La entrega tiene que salir de Supabase Storage.
 *
 * Y las tres cosas de la Fase 1: EPUB maquetado, PDF de lectura y portada.
 */
export const EBOOK_SALES_PAUSED = true;

/** A dónde van los CTA de compra mientras la venta está en pausa. */
export const WAITLIST_PATH = '/lista-de-espera';

/** Etiqueta de los CTA en pausa. Sin promesa de fecha: todavía no hay una. */
export const WAITLIST_CTA_LABEL = 'Avísame cuando salga';
