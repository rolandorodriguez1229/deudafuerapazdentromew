#!/usr/bin/env python3
"""
Sube los entregables al bucket privado `entregas` de Supabase Storage.

Los archivos salen de build/ (los generan build-epub.py, build-pdf.py y
build-anexos.py). Nunca se copian a public/: ese era el problema original.

Lee las credenciales de .env.local, o de las variables de entorno si están
puestas. Para producción hay que apuntar NEXT_PUBLIC_SUPABASE_URL y
SUPABASE_SERVICE_ROLE_KEY al proyecto real — eso lo hace Rolando.

Uso:
    python3 scripts/subir-entregables.py            # sube lo que falte o cambió
    python3 scripts/subir-entregables.py --listar   # solo muestra qué hay
"""
from __future__ import annotations

import json
import mimetypes
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
BUCKET = "entregas"

# ruta local → ruta dentro del bucket. Tiene que coincidir con CATALOGO en
# src/lib/entregas.ts, que es lo que la página firma.
ARCHIVOS = {
    RAIZ / "build/epub/deuda-fuera-paz-dentro.epub": "libro/deuda-fuera-paz-dentro.epub",
    RAIZ / "build/pdf/deuda-fuera-paz-dentro.pdf": "libro/deuda-fuera-paz-dentro.pdf",
    RAIZ / "build/anexos/guia-estrategias.pdf": "anexos/guia-estrategias.pdf",
    RAIZ / "build/anexos/scripts-negociacion.pdf": "anexos/scripts-negociacion.pdf",
    RAIZ / "build/anexos/calendario-7-3-1.ics": "anexos/calendario-7-3-1.ics",
}

mimetypes.add_type("application/epub+zip", ".epub")
mimetypes.add_type("text/calendar", ".ics")


def entorno() -> tuple[str, str]:
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    env = RAIZ / ".env.local"
    if (not url or not key) and env.exists():
        for linea in env.read_text().splitlines():
            if "=" not in linea or linea.strip().startswith("#"):
                continue
            k, v = linea.split("=", 1)
            v = v.strip().strip('"').strip("'")
            if k.strip() == "NEXT_PUBLIC_SUPABASE_URL" and not url:
                url = v
            elif k.strip() == "SUPABASE_SERVICE_ROLE_KEY" and not key:
                key = v
    if not url or not key:
        sys.exit(
            "Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY "
            "(ni en el entorno ni en .env.local)."
        )
    return url.rstrip("/"), key


def pedir(metodo: str, url: str, key: str, cuerpo: bytes | None = None,
          content_type: str | None = None) -> tuple[int, bytes]:
    req = urllib.request.Request(url, data=cuerpo, method=metodo)
    req.add_header("Authorization", f"Bearer {key}")
    req.add_header("apikey", key)
    if content_type:
        req.add_header("Content-Type", content_type)
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def listar(base: str, key: str) -> dict[str, int]:
    """Lo que ya hay en el bucket, por ruta y tamaño."""
    out: dict[str, int] = {}
    for prefijo in ("libro", "anexos"):
        estado, cuerpo = pedir(
            "POST", f"{base}/storage/v1/object/list/{BUCKET}", key,
            json.dumps({"prefix": prefijo, "limit": 100}).encode(), "application/json",
        )
        if estado != 200:
            continue
        for obj in json.loads(cuerpo):
            tam = (obj.get("metadata") or {}).get("size", 0)
            out[f"{prefijo}/{obj['name']}"] = tam
    return out


def main() -> int:
    base, key = entorno()
    solo_listar = "--listar" in sys.argv
    destino_host = base.replace("https://", "").replace("http://", "")
    print(f"Bucket «{BUCKET}» en {destino_host}\n")

    existentes = listar(base, key)
    if solo_listar:
        if not existentes:
            print("  (vacío)")
        for ruta, tam in sorted(existentes.items()):
            print(f"  {ruta:44s} {tam / 1024:8.1f} KB")
        return 0

    faltan = [p for p in ARCHIVOS if not p.exists()]
    if faltan:
        print("Faltan archivos por construir:", file=sys.stderr)
        for f in faltan:
            print(f"  {f.relative_to(RAIZ)}", file=sys.stderr)
        print("\nCorre antes: build-epub.py, build-pdf.py y build-anexos.py", file=sys.stderr)
        return 1

    subidos = 0
    for local, remoto in ARCHIVOS.items():
        datos = local.read_bytes()
        if existentes.get(remoto) == len(datos):
            print(f"  = {remoto:44s} sin cambios")
            continue
        ct = mimetypes.guess_type(local.name)[0] or "application/octet-stream"
        # upsert: volver a subir tras regenerar el libro tiene que funcionar
        url = f"{base}/storage/v1/object/{BUCKET}/{remoto}"
        estado, resp = pedir("POST", url, key, datos, ct)
        if estado == 409:
            estado, resp = pedir("PUT", url, key, datos, ct)
        if estado not in (200, 201):
            print(f"  ✗ {remoto}: HTTP {estado} {resp[:180].decode(errors='replace')}",
                  file=sys.stderr)
            return 1
        print(f"  ↑ {remoto:44s} {len(datos) / 1024:8.1f} KB  ({ct})")
        subidos += 1

    print(f"\n{subidos} archivo(s) subido(s), {len(ARCHIVOS) - subidos} sin cambios.")
    print("El bucket es privado: solo el service-role puede firmar URLs.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
