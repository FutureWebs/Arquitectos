# Protocolo de integración: web hija (Angular) ⇄ web padre (React)

La web del recorrido 360 se carga dentro de la web del cliente en un `<iframe>`.
La comunicación se hace con `window.postMessage` + el evento `'message'`.

Archivos del contrato:

- `src/app/models/embed-protocol.ts` — tipos, constantes y guards
- `src/app/services/parent-bridge.service.ts` — emisión/recepción en la hija
- `src/environments/environment.ts` → `embed.parentOrigin` / `embed.allowedOrigins`
  - **Producción** (desplegado): origen y destino = `https://singapur-tower.skaleon.ai`
  - **Desarrollo**: `parentOrigin: '*'` + allowlist con `localhost:4400` (harness de pruebas) y `localhost:4200`

---

## Implementación en la web del cliente

Nuestra web desplegada (la hija):

```
https://futurewebs.github.io/Arquitectos/home
```

> Notas sobre esa URL:
> - GitHub Pages **no tiene fallback SPA**: una petición fresca a `/Arquitectos/home`
>   sirve un stub `home/index.html` que redirige a la raíz de la app; Angular arranca
>   y el router deja la URL en `/home`. También podés apuntar directo a
>   `https://futurewebs.github.io/Arquitectos/` (redirige a `/home`).
> - Verificado que GitHub Pages **no envía** `X-Frame-Options` ni CSP
>   `frame-ancestors`: el sitio **puede** ser embebido en un iframe.
>   (Del lado del cliente, asegurarse de que su CSP no lo bloquee.)

### Paso a paso (React)

1. **Escuchar mensajes** apenas monte el componente (antes de crear el iframe, para no perder el `APP_READY`):

```tsx
useEffect(() => {
  const onMessage = (e: MessageEvent) => {
    if (e.origin !== 'https://futurewebs.github.io') return; // validar SIEMPRE el origen
    const msg = e.data;
    if (msg?.type === 'APP_READY') {
      // La hija está lista → enviarle la info verídica de cada depto
      e.source?.postMessage({
        source: 'cliente-react',
        type: 'CONFIG',
        version: '1.0',
        payload: { deptos: deptosDeMiBase },   // ver tabla de campos más abajo
      }, 'https://futurewebs.github.io');
    }
    if (msg?.type === 'DEPTO_SELECTED') {
      abrirMiModal(msg.payload.depto);        // lógica del cliente
    }
  };
  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}, []);
```

2. **Montar el iframe** (donde el cliente quiera mostrar el recorrido):

```tsx
<iframe
  src="https://futurewebs.github.io/Arquitectos/home"
  title="Recorrido 360"
  allow="fullscreen"
  style={{ width: '100%', height: '100%', border: 0 }}
/>
```

3. **Clic en un depto dentro del recorrido**: la hija emite `DEPTO_SELECTED`
   (ya **no** abre ningún modal propio) y el cliente abre SU modal con
   `msg.payload.depto`.

4. **Reenviar `CONFIG`** siempre que cambien estados/precios: es idempotente,
   la hija lo vuelve a aplicar y repinta los badges.

5. **Deploy**: cada push a `main` dispara el workflow de GitHub Pages
   (`.github/workflows/deploy.yml`) y publica el build con estas URLs.

---

## Secuencia

```
Padre (React)                                 Hija (Angular, iframe)
    │  crea el iframe / modal                      │
    │ ────────────────────────────────────────────▶│  carga
    │◀──── { type: "APP_READY" } ──────────────────│  (hija listo)
    │ ─── { type: "CONFIG", deptos: [...] } ──────▶│  info verídica por depto
    │                                              │  → pisa badges/estados/números
    │◀── { type: "DEPTO_SELECTED", depto: {...} }──│  clic en el SVG de un depto
    │  abre SU modal con esa info                  │
```

Notas de robustez:

- El padre **puede** enviar `CONFIG` apenas se monte el iframe (sin esperar
  `APP_READY`): si llega antes, la hija lo aplica igual; y si el `APP_READY`
  llega tarde al padre, reenviar `CONFIG` es **idempotente** (se puede mandar
  las veces que haga falta, p.ej. cuando cambien estados).
- Si el padre no recibe `APP_READY`, revisar que esté escuchando `'message'`
  **antes** de crear el iframe.

## Mensajes

Envelope común:

```json
{
  "source": "torre-angular | <id del padre>",
  "type": "APP_READY | CONFIG | DEPTO_SELECTED",
  "version": "1.0",
  "payload": { }
}
```

### 1. `APP_READY` (hija → padre)

```json
{ "source": "torre-angular", "type": "APP_READY", "version": "1.0", "payload": null }
```

### 2. `CONFIG` (padre → hija)

`payload.deptos[]` — un registro por depto:

| campo | tipo | requerido | notas |
|---|---|---|---|
| `dbId` | string | ✅ | id en la DB del cliente; se devuelve en `DEPTO_SELECTED` |
| `piso` | number \| string | ✅ | n.º de piso (1..21) — clave de match |
| `numero` | number \| string | ✅ | n.º de depto (1..17) — clave de match |
| `estado` | `"DISPONIBLE" \| "RESERVADO" \| "VENDIDO"` | ✅ | se ignora si no es uno válido |
| `titulo` | string | – | pisa el título del depto |
| `disponibilidadText` | string | – | pisa el texto de disponibilidad |
| `tipologia` | string | – | pisa la tipología |
| `precio` / otros | – | – | campos extra permitidos (se ignoran por ahora) |

Match: `piso` + `numero` contra nuestros `P{piso}-Apto-{numero}`. Los deptos que
no vengan en el `CONFIG` conservan sus datos locales.

```json
{
  "source": "cliente-react",
  "type": "CONFIG",
  "version": "1.0",
  "payload": {
    "deptos": [
      { "dbId": "db-001", "piso": 1, "numero": 11, "estado": "VENDIDO",
        "disponibilidadText": "Vendido", "titulo": "Apto-11" },
      { "dbId": "db-002", "piso": 7, "numero": 5, "estado": "RESERVADO" }
    ]
  }
}
```

### 3. `DEPTO_SELECTED` (hija → padre)

Se emite al clickear el SVG/badge de un depto (en modo embebido **no** se abre
el modal local; la hija solo notifica).

```json
{
  "source": "torre-angular",
  "type": "DEPTO_SELECTED",
  "version": "1.0",
  "payload": {
    "depto": {
      "dbId": "db-001",
      "id": "P1-Apto-11",
      "piso": "1",
      "numero": "11",
      "titulo": "Apto-11",
      "estado": "VENDIDO",
      "badge": "1-11"
    }
  }
}
```

---

## Ejemplo React (padre)

```tsx
useEffect(() => {
  const onMessage = (e: MessageEvent) => {
    // Validar SIEMPRE el origen en producción:
    // if (e.origin !== 'https://dominio-de-la-hija') return;
    const msg = e.data;
    if (msg?.type === 'APP_READY') {
      e.source?.postMessage({
        source: 'cliente-react',
        type: 'CONFIG',
        version: '1.0',
        payload: { deptos: deptosDeMiBase },   // [{ dbId, piso, numero, estado, ... }]
      }, '*');                                 // targetOrigin: dominio de la hija
    }
    if (msg?.type === 'DEPTO_SELECTED') {
      abrirMiModal(msg.payload.depto);         // lógica del cliente
    }
  };
  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}, []);
```

```tsx
<iframe src="https://<dominio-de-la-hija>/" allow="fullscreen" />
```

## Seguridad

- La hija **solo** acepta mensajes cuyo `event.source === window.parent`
  y con `event.origin` dentro de `environment.embed.allowedOrigins`.
- El padre debe hacer lo simétrico: validar `e.origin` contra el dominio de
  la hija antes de procesar cualquier mensaje.
- Nunca usar `JSON.parse` sobre `event.data` (postMessage ya entrega objetos
  clonados); la forma se valida con los guards del protocolo.
