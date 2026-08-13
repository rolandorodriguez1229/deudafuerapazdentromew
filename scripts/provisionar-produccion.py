#!/usr/bin/env python3
"""
Deja producción completa en un solo comando, una vez que haya sesión de Supabase.

Qué hace, en orden y deteniéndose ante cualquier problema:
  1. Crea el proyecto de Supabase (plan gratuito, us-east-1) — o reutiliza el
     que ya exista con ese nombre.
  2. Aplica las cuatro migraciones y las verifica.
  3. Configura en Vercel las variables que se derivan del proyecto.
  4. Sube los entregables al bucket privado y comprueba que se firman.

Qué NO hace, a propósito:
  · No crea nada de pago. Si la organización ya agotó los proyectos gratuitos,
    se detiene y lo dice, en vez de escalar a un plan con cobro.
  · No imprime contraseñas ni claves. La contraseña de la base se genera aquí,
    se guarda en .env.produccion.local (fuera de git, permisos 600) y se
    registra en Supabase. Nunca sale por pantalla.

REQUISITO PREVIO — hay que hacerlo a mano una sola vez:

    npx supabase login

Ese login abre el navegador o pide un token de acceso personal. Es lo único
que no se puede automatizar: Supabase exige que lo apruebe una persona.

Uso:
    npx supabase login          # una vez
    python3 scripts/provisionar-produccion.py
    python3 scripts/provisionar-produccion.py --dry-run   # solo enseña el plan
"""
from __future__ import annotations

import json
import os
import re
import secrets
import string
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
NOMBRE_PROYECTO = "deuda-fuera-paz-dentro"
# El despliegue de Vercel corre en iad1 (Washington D.C.); us-east-1 es la
# región de Supabase que le queda al lado.
REGION = "us-east-1"
PLAN = "free"
ENV_PROD = RAIZ / ".env.produccion.local"

SECO = "--dry-run" in sys.argv


def paso(txt: str) -> None:
    print(f"\n── {txt}")


def ok(txt: str) -> None:
    print(f"   ✓ {txt}")


def alto(txt: str) -> None:
    print(f"\n   ✗ {txt}", file=sys.stderr)
    raise SystemExit(1)


def correr(cmd: list[str], **kw) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True, cwd=RAIZ, **kw)


# ── Supabase Management API ───────────────────────────────────────────


def token_supabase() -> str:
    t = os.environ.get("SUPABASE_ACCESS_TOKEN")
    if t:
        return t
    for p in (
        Path.home() / ".supabase/access-token",
        Path.home() / ".config/supabase/access-token",
        Path.home() / ".local/share/supabase/access-token",
    ):
        if p.exists():
            return p.read_text().strip()
    alto(
        "No hay sesión de Supabase.\n"
        "     Corre primero:  npx supabase login\n"
        "     Es lo único que no se puede automatizar: Supabase pide aprobación humana."
    )


def api(token: str, metodo: str, ruta: str, cuerpo: dict | None = None):
    req = urllib.request.Request(
        "https://api.supabase.com" + ruta,
        data=json.dumps(cuerpo).encode() if cuerpo else None,
        method=metodo,
    )
    req.add_header("Authorization", f"Bearer {token}")
    if cuerpo:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            return r.status, json.load(r) if r.length != 0 else {}
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:400]


def contrasena() -> str:
    """Contraseña fuerte sin caracteres que rompan una cadena de conexión."""
    alfabeto = string.ascii_letters + string.digits + "-_.~"
    return "".join(secrets.choice(alfabeto) for _ in range(40))


# ── Pasos ─────────────────────────────────────────────────────────────


def crear_proyecto(token: str) -> tuple[str, str]:
    paso("1. Proyecto de Supabase")
    s, orgs = api(token, "GET", "/v1/organizations")
    if s != 200:
        alto(f"No pude listar organizaciones: {orgs}")
    if not orgs:
        alto("La cuenta no tiene ninguna organización.")
    org = orgs[0]
    print(f"   organización: {org['name']}")

    s, proyectos = api(token, "GET", "/v1/projects")
    if s != 200:
        alto(f"No pude listar proyectos: {proyectos}")
    existente = next((p for p in proyectos if p["name"] == NOMBRE_PROYECTO), None)
    if existente:
        ok(f"ya existe «{NOMBRE_PROYECTO}» ({existente['region']}) — se reutiliza")
        return existente["id"], ""

    activos = [p for p in proyectos if p.get("status") not in ("INACTIVE", "REMOVED")]
    print(f"   proyectos activos en la cuenta: {len(activos)}")
    if len(activos) >= 2:
        alto(
            "La organización ya tiene 2 proyectos activos, que es el tope del plan\n"
            "     gratuito. Crear otro exigiría pasar a un plan de pago.\n"
            "     Como no está autorizado generar cobros, me detengo aquí.\n"
            "     Opciones: pausar un proyecto que no uses, o autorizar el plan Pro."
        )

    if SECO:
        ok(f"crearía «{NOMBRE_PROYECTO}» en {REGION}, plan {PLAN}")
        return "", ""

    pwd = contrasena()
    s, d = api(token, "POST", "/v1/projects", {
        "name": NOMBRE_PROYECTO,
        "organization_id": org["id"],
        "region": REGION,
        "plan": PLAN,
        "db_pass": pwd,
    })
    if s not in (200, 201):
        alto(f"No pude crear el proyecto: {d}")
    ref = d["id"]
    ok(f"creado: {ref} ({REGION}, plan {PLAN})")

    print("   esperando a que arranque…", end="", flush=True)
    for _ in range(60):
        time.sleep(10)
        s, p = api(token, "GET", f"/v1/projects/{ref}")
        estado = p.get("status") if s == 200 else "?"
        print(".", end="", flush=True)
        if estado == "ACTIVE_HEALTHY":
            print()
            ok("activo")
            break
    else:
        print()
        alto("El proyecto no llegó a ACTIVE_HEALTHY en 10 minutos.")
    return ref, pwd


def guardar_env(ref: str, pwd: str, token: str) -> dict:
    paso("2. Credenciales (se guardan, no se muestran)")
    s, claves = api(token, "GET", f"/v1/projects/{ref}/api-keys")
    if s != 200:
        alto(f"No pude leer las claves: {claves}")
    por_nombre = {k["name"]: k["api_key"] for k in claves}
    env = {
        "NEXT_PUBLIC_SUPABASE_URL": f"https://{ref}.supabase.co",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY": por_nombre.get("anon", ""),
        "SUPABASE_SERVICE_ROLE_KEY": por_nombre.get("service_role", ""),
    }
    if pwd:
        env["SUPABASE_DB_PASSWORD"] = pwd
    faltan = [k for k, v in env.items() if not v]
    if faltan:
        alto(f"Supabase no devolvió: {faltan}")
    ENV_PROD.write_text("".join(f"{k}={v}\n" for k, v in env.items()))
    ENV_PROD.chmod(0o600)
    ok(f"guardadas en {ENV_PROD.name} (permisos 600, fuera de git)")
    return env


def migraciones(ref: str, pwd: str) -> None:
    paso("3. Migraciones")
    r = correr(["npx", "supabase", "link", "--project-ref", ref],
               env={**os.environ, "SUPABASE_DB_PASSWORD": pwd})
    if r.returncode != 0:
        alto(f"link falló: {r.stderr[-300:]}")
    ok("proyecto enlazado")

    r = correr(["npx", "supabase", "db", "push", "--linked", "--dry-run"],
               env={**os.environ, "SUPABASE_DB_PASSWORD": pwd})
    print("   previsualización:", (r.stdout or r.stderr).strip()[-200:])

    r = correr(["npx", "supabase", "db", "push", "--linked"],
               env={**os.environ, "SUPABASE_DB_PASSWORD": pwd})
    if r.returncode != 0:
        alto(f"db push falló: {(r.stderr or r.stdout)[-400:]}")
    ok("las cuatro migraciones aplicadas")

    r = correr(["npx", "supabase", "migration", "list", "--linked"],
               env={**os.environ, "SUPABASE_DB_PASSWORD": pwd})
    aplicadas = len(re.findall(r"000[1-4]", r.stdout))
    if aplicadas < 4:
        alto(f"solo {aplicadas} migraciones en el historial remoto")
    ok("historial remoto: 0001, 0002, 0003 y 0004")


def variables_vercel(env: dict) -> None:
    paso("4. Variables en Vercel")
    for clave in ("NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY",
                  "SUPABASE_SERVICE_ROLE_KEY"):
        sensible = clave == "SUPABASE_SERVICE_ROLE_KEY"
        for entorno in ("production", "preview"):
            correr(["npx", "vercel", "env", "rm", clave, entorno, "--yes"])
            cmd = ["npx", "vercel", "env", "add", clave, entorno,
                   "--value", env[clave], "--yes"]
            if not sensible:
                cmd.append("--no-sensitive")
            r = correr(cmd)
            if r.returncode != 0:
                alto(f"no pude configurar {clave} en {entorno}: {r.stderr[-200:]}")
        ok(f"{clave} configurada (production y preview)")


def entregables(env: dict) -> None:
    paso("5. Entregables")
    for guion in ("build-epub.py", "build-pdf.py", "build-anexos.py"):
        r = correr([sys.executable, f"scripts/{guion}"])
        if r.returncode != 0:
            alto(f"{guion} falló: {r.stderr[-200:]}")
    ok("EPUB, PDF y anexos regenerados")

    r = correr([sys.executable, "scripts/subir-entregables.py"],
               env={**os.environ,
                    "NEXT_PUBLIC_SUPABASE_URL": env["NEXT_PUBLIC_SUPABASE_URL"],
                    "SUPABASE_SERVICE_ROLE_KEY": env["SUPABASE_SERVICE_ROLE_KEY"]})
    if r.returncode != 0:
        alto(f"la subida falló: {(r.stderr or r.stdout)[-300:]}")
    print("   " + "\n   ".join(r.stdout.strip().splitlines()[-6:]))
    ok("archivos en el bucket privado")


def main() -> int:
    print("Provisión de producción — Deuda Fuera, Paz Dentro")
    if SECO:
        print("(simulación: no se crea ni se cambia nada)")
    token = token_supabase()
    ref, pwd = crear_proyecto(token)
    if SECO:
        print("\nSimulación terminada.")
        return 0
    env = guardar_env(ref, pwd, token)
    migraciones(ref, pwd or env.get("SUPABASE_DB_PASSWORD", ""))
    variables_vercel(env)
    entregables(env)
    print("\n── Listo. Falta solo lo que depende de ti:")
    print("   · RESEND_API_KEY y EMAIL_FROM (para que salgan los correos)")
    print("   · EMAIL_POSTAL_ADDRESS (la exige CAN-SPAM)")
    print("   · un despliegue para que Vercel tome las variables nuevas:")
    print("       git commit --allow-empty -m 'redespliegue' && git push")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
