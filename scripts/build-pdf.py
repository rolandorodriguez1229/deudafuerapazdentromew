#!/usr/bin/env python3
"""
Construye el PDF de lectura desde el mismo manuscrito que el EPUB.

Reutiliza el conversor de build-epub.py, así que el PDF y el EPUB nunca pueden
decir cosas distintas: salen del mismo árbol de capítulos. Lo único que cambia
es la presentación.

Se imprime con Chromium (vía Playwright) porque es lo que hay en esta máquina y
porque hace bien lo que hace falta: paginación real, marcadores navegables
(`outline`) y PDF etiquetado para lectores de pantalla (`tagged`).

Formato 6×9 pulgadas, el estándar de bolsillo comercial. Sirve para leer en
pantalla y deja el interior listo para cuando toque la edición impresa.

Uso: python3 scripts/build-pdf.py
"""
from __future__ import annotations

import importlib.util
import sys
import tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "build/pdf"

# Se importa build-epub.py por ruta: el guion en el nombre impide el import normal.
_spec = importlib.util.spec_from_file_location("build_epub", Path(__file__).parent / "build-epub.py")
_be = importlib.util.module_from_spec(_spec)
assert _spec.loader
_spec.loader.exec_module(_be)

CSS_PDF = """
@page { size: 6in 9in; margin: 0.75in 0.7in 0.85in 0.7in; }
* { box-sizing: border-box; }
body { font-family: Georgia, "Times New Roman", serif; font-size: 10.5pt;
       line-height: 1.5; margin: 0; color: #111; hyphens: auto;
       -webkit-hyphens: auto; text-align: justify; }
h1 { font-size: 17pt; line-height: 1.2; margin: 0 0 0.7em; text-align: left;
     page-break-before: always; break-before: page; page-break-after: avoid; }
h1.titulo-libro { font-size: 26pt; text-align: center; margin-top: 2.4in;
                  page-break-before: avoid; break-before: auto; }
h2 { font-size: 12pt; margin: 1.5em 0 0.45em; line-height: 1.25;
     page-break-after: avoid; break-after: avoid; text-align: left; }
p { margin: 0 0 0.6em; orphans: 2; widows: 2; }
p.subtitulo { text-align: center; font-style: italic; color: #444; font-size: 12pt; }
p.autor { text-align: center; margin-top: 1.6em; font-size: 11pt; }
p.creditos { font-size: 8.5pt; color: #444; text-align: left; }
p.nota { margin-left: 0.5em; }
p.tarea { border-left: 2.5px solid #888; padding: 0.35em 0 0.35em 0.7em; margin: 1em 0;
          text-align: left; }
p.aviso { border-left: 2.5px solid #a33; padding: 0.35em 0 0.35em 0.7em; margin: 1em 0;
          text-align: left; }
ul { margin: 0 0 0.7em 1em; padding: 0; text-align: left; }
li { margin-bottom: 0.25em; }
hr.separador { border: none; text-align: center; margin: 1.4em 0; }
hr.separador::after { content: "• • •"; color: #777; letter-spacing: 0.3em; }
table { border-collapse: collapse; width: 100%; font-size: 8.5pt; margin: 0.8em 0;
        page-break-inside: avoid; break-inside: avoid; }
th, td { border: 0.5pt solid #999; padding: 0.3em 0.4em; text-align: left;
         vertical-align: top; }
th { background: #eee; font-weight: bold; }
a { color: #14524b; text-decoration: none; }
nav.indice { page-break-before: always; break-before: page; }
nav.indice ol { list-style: none; padding-left: 0; }
nav.indice li { margin-bottom: 0.3em; text-align: left; }
nav.indice li.parte { font-weight: bold; margin-top: 0.8em; }
/* Portada a sangre: se anulan los márgenes de @page para esa página */
section.portada { page-break-after: always; break-after: page;
                  margin: -0.75in -0.7in 0 -0.7in; }
section.portada img { display: block; width: 6in; height: 9in; object-fit: cover; }
"""

PIE = """
<div style="font-family: Georgia, serif; font-size: 8pt; color:#666; width:100%;
            text-align:center; padding: 0 0.7in;">
  <span class="pageNumber"></span>
</div>
"""


def main() -> int:
    ruta = Path(sys.argv[1]) if len(sys.argv) > 1 else _be.DOCX_POR_DEFECTO
    if not ruta.exists():
        print(f"No encuentro el manuscrito: {ruta}", file=sys.stderr)
        return 1

    caps, stats = _be.construir(ruta)
    portada = stats.get("portada")

    # Índice navegable propio: el del .docx es un campo de Word que aquí no sirve.
    entradas = []
    for i, c in enumerate(caps[1:], start=1):
        clase = ' class="parte"' if c.nivel == 1 else ""
        entradas.append(f'<li{clase}><a href="#c{i}">{_be.esc(c.titulo)}</a></li>')

    # La portada, como primera página a sangre completa. Va incrustada en base64
    # para que el HTML temporal sea autocontenido y Chromium no dependa de rutas.
    secciones = []
    if portada:
        import base64
        datos, tipo = portada
        b64 = base64.b64encode(datos).decode()
        secciones.append(
            f'<section class="portada"><img src="data:image/{tipo};base64,{b64}" '
            f'alt="Deuda Fuera, Paz Dentro"/></section>'
        )
    secciones.append(f'<section id="c0">{"".join(caps[0].cuerpo)}</section>')
    secciones.append(
        '<nav class="indice"><h1>Índice</h1><ol>' + "".join(entradas) + "</ol></nav>"
    )
    for i, c in enumerate(caps[1:], start=1):
        cuerpo = "".join(c.cuerpo).replace("<h1>", f'<h1 id="c{i}">', 1)
        secciones.append(f"<section>{cuerpo}</section>")

    doc_html = f"""<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>{_be.esc(_be.META['titulo'])}</title><style>{CSS_PDF}</style></head>
<body>{"".join(secciones)}</body></html>"""

    SALIDA.mkdir(parents=True, exist_ok=True)
    destino = SALIDA / "deuda-fuera-paz-dentro.pdf"

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Falta playwright: pip install playwright && playwright install chromium",
              file=sys.stderr)
        return 1

    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
        f.write(doc_html)
        tmp = Path(f.name)

    try:
        with sync_playwright() as p:
            navegador = p.chromium.launch()
            pagina = navegador.new_page()
            pagina.goto(tmp.as_uri())
            pagina.wait_for_load_state("networkidle")
            pagina.pdf(
                path=str(destino),
                format=None,
                width="6in",
                height="9in",
                print_background=True,
                prefer_css_page_size=True,
                display_header_footer=True,
                header_template="<div></div>",
                footer_template=PIE,
                outline=True,   # marcadores navegables desde los <h1>/<h2>
                tagged=True,    # PDF etiquetado: lectores de pantalla
            )
            navegador.close()
    finally:
        tmp.unlink(missing_ok=True)

    kb = destino.stat().st_size / 1024
    print(f"PDF: {destino}  ({kb:.0f} KB)")
    print(f"  {len(caps)} secciones · {stats['parrafos']} párrafos · "
          f"{stats['tablas']} tablas · 6×9 pulgadas")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
