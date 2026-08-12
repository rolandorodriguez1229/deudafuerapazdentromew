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
 * Cómo volver a encender: poner esto en `false` cuando estén las tres cosas de
 * la Fase 1 de la ruta de lanzamiento — EPUB maquetado, PDF de lectura y
 * entrega con enlaces firmados que caduquen. Es un solo cambio de línea; no
 * hay nada más que revertir.
 */
export const EBOOK_SALES_PAUSED = true;

/** A dónde van los CTA de compra mientras la venta está en pausa. */
export const WAITLIST_PATH = '/lista-de-espera';

/** Etiqueta de los CTA en pausa. Sin promesa de fecha: todavía no hay una. */
export const WAITLIST_CTA_LABEL = 'Avísame cuando salga';
