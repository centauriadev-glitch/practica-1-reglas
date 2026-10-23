# Reglas de seguridad del proyecto

Aplica estas reglas en todo el código que generes para este proyecto.

- Valida toda entrada en el servidor con un esquema (tipos, longitudes, rangos).
- Usa consultas parametrizadas; nunca concatenes SQL con datos del usuario.
- Nunca guardes ni registres el número de tarjeta completo; muestra solo los últimos 4 dígitos.
- Lee secretos (llaves, contraseñas, tokens) solo de variables de entorno; nunca los escribas en el código.
- Devuelve mensajes de error genéricos; registra el detalle solo en el servidor.
- Antes de instalar un paquete, confirma que existe en el registro oficial y explica por qué se necesita.
- Escribe pruebas automáticas para cada control de seguridad.
- Antes de escribir código, muestra un plan con los controles de seguridad que vas a implementar.
