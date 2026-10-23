# Práctica 1 · Reglas de seguridad para el agente

**Temas 1 y 2 · 40 minutos**

**Objetivo:** comprobar cuánto cambia el código que genera el agente cuando el proyecto
define reglas de seguridad.

**Entregable:** dos ramas (`sin-reglas` y `con-reglas`) y la tabla `comparacion.md` llena.

## Pasos

1. Abre esta carpeta en Antigravity y en la terminal ejecuta:
   ```bash
   git init -b main
   git add . && git commit -m "Inicio de la práctica 1"
   git checkout -b sin-reglas
   ```
2. Confirma que la política de terminal está en **Request Review**.
3. Copia el **Prompt A** de `prompts.md` en el agente. Revisa cada cambio y acéptalo.
   Luego haz commit:
   ```bash
   git add . && git commit -m "Endpoint generado sin reglas"
   ```
4. Crea la segunda rama desde el inicio y activa las reglas:
   ```bash
   git checkout main
   git checkout -b con-reglas
   mkdir -p .agents/rules
   cp reglas/seguridad.md .agents/rules/seguridad.md
   ```
   Verifica en el panel de personalización del agente que la regla aparece.
5. Abre una **conversación nueva** y usa de nuevo el **Prompt A**, en modo de planificación.
   Lee el plan antes de aprobarlo. Haz commit al terminar.
6. Sube el repositorio a GitHub, analiza ambas ramas en SonarCloud y llena `comparacion.md`.

## Criterios de verificación

- [ ] La rama `con-reglas` no tiene vulnerabilidades nuevas en SonarCloud.
- [ ] Ningún número de tarjeta completo aparece en logs ni en respuestas.
- [ ] No hay secretos escritos en el código.
- [ ] El agente pidió permiso antes de cada comando.

## Para discutir

- ¿Qué controles agregó el agente solo cuando se los pedimos?
- ¿Alguna regla no se cumplió aunque estaba escrita? ¿Cómo lo detectaron?
