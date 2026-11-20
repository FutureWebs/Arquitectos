# Guía de integración — Recorrido 360 (Angular) dentro de la web del cliente (React)

> **Audiencia**: equipo de React (cliente) + equipo Angular (nosotros).
> **Objetivo**: que el recorrido 360 viva dentro de la web del cliente en un `<iframe>`,
> y que al tocar un departamento **el modal que se abra sea el del cliente (React)**,
> alimentado con la información verídica de su base de datos.

---

## 0. Resumen en 30 segundos

```
┌────────────────────────── Web del cliente (React) ──────────────────────────────┐
│                                                                                 │
│   ┌─────────────── <iframe> ───────────────────┐   postMessage                 │
│   │  Recorrido 360 (Angular, desplegado en      │ ◀── CONFIG { deptos:[...] }   │
│   │  futurewebs.github.io/Arquitectos)          │ ──▶ APP_READY                 │
│   │                                              │ ──▶ DEPTO_SELECTED {depto}   │
│   │  badges: "1-11" ●rojo = VENDIDO (del padre)  │                              │
│   └──────────────────────────────────────────────┘                              │
│                                                     al recibir DEPTO_SELECTED:  │
│                                                   → abre el MODAL del cliente  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Tecnología de conexión**: `window.postMessage()` + evento `'message'`
(único mecanismo estándar que permite comunicación **bidireccional, en tiempo real
y segura entre orígenes distintos**).

| | Origen |
|---|---|
| Web hija (Angular, nuestra) | `https://futurewebs.github.io` |
| Web padre (React, cliente) | `https://singapur-tower.skaleon.ai` |

Alternativas **descartadas** (no sirven para dos orígenes distintos):
`BroadcastChannel` / `SharedWorker` / `localStorage` (solo mismo origen),
`CustomEvent` (solo misma ventana), parámetros de URL (unidireccional y sin tiempo real),
WebRTC/WebSockets (sobreingeniería).

---

## 1. Arquitectura: qué archivos manejan esto del lado Angular

| Archivo | Rol |
|---|---|
| `src/app/models/embed-protocol.ts` | **Contrato completo**: interfaces de los mensajes (`MensajeEmbed`, `DeptoExterno`, `DeptoSeleccionado`), constantes (`TIPO_MENSAJE`, `SOURCE_HIJA`, `PROTOCOLO_VERSION`), fabricadores (`mensajeAppReady()`, `mensajeDeptoSelected()`) y guards (`esMensajeEmbed()`, `esConfigMsg()`, `claveDepto()`, `numeroDeId()`) |
| `src/app/services/parent-bridge.service.ts` | **El puente**: escucha `message`, valida origen+forma, aplica el `CONFIG` a los pisos (`parchearDeptos()`), emite `APP_READY` (`avisarListo()`) y `DEPTO_SELECTED` (`notificarDepto()`) |
| `src/app/components/main/main.component.ts` | Orquesta: en `ngOnInit()` llama a `avisarListo()`; los2 `effect()` aplican/repintan el `CONFIG`; `onDeptoClick(apto)` decide que el clic se notifica al padre (**no abre modal local**) |
| `src/app/components/edificio-overlay/*.html` | Los SVG de deptos y sus badges emiten `apartmentSelected` al hacer clic |
| `src/environments/environment.ts` / `.prod.ts` | `embed.parentOrigin` (targetOrigin al enviar) y `embed.allowedOrigins` (orígenes aceptados al recibir) |
| `angular.json` | `fileReplacements` en `production` → el build de deploy usa `environment.prod.ts` (estricto) |
| `public/home/index.html` | Stub: `https://futurewebs.github.io/Arquitectos/home` redirige a la raíz de la app (GH Pages no tiene fallback SPA) |
| `docs/embed-protocol.md` | Este documento |

---

## 2. Secuencia de vida (handshake)

```
1. React monta el <iframe src=".../Arquitectos/home">
2. Angular carga y, en ngOnInit, envía:
      Angular ── { type: "APP_READY" } ──────────────────▶ React
3. React responde con la info de TODOS sus deptos:
      Angular ◀── { type: "CONFIG", deptos: [...] } ────── React
4. Angular pinta los badges con esa info (estado → color del punto,
   número → etiqueta "P-N")
5. El usuario toca un depto (SVG o badge):
      Angular ── { type: "DEPTO_SELECTED", depto: {...} } ─▶ React
6. React abre SU modal con payload.depto
7. (Opcional) Cuando cambien estados/precios, React reenvía CONFIG
   → es idempotente, Angular lo vuelve a aplicar y repinta
```

**Importante sobre el orden**: si React envía `CONFIG` apenas crea el iframe
(sin esperar `APP_READY`), Angular también lo aplica (el listener ya está
registrado antes del primer render). Si `CONFIG` llegara *antes* de que Angular
termine de cargar los pisos, el `effect` lo aplica en cuanto los datos estén
listos. **Se puede enviar `CONFIG` las veces que haga falta.**

---

## 3. Mensaje por mensaje

### 3.1 `APP_READY` — Angular → React

"Notificación de que la hija está lista para recibir datos."

```json
{
  "source": "torre-angular",
  "type": "APP_READY",
  "version": "1.0",
  "payload": null
}
```

- **Cuándo se emite**: en `ngOnInit()` del `MainComponent`, vía `ParentBridgeService.avisarListo()`.
- **Solo si hay padre**: si `window.parent === window` (la web abierta sola) no se emite nada.
- **Recomendación**: React debe responder con `CONFIG` **siempre** que reciba `APP_READY`.

---

### 3.2 `CONFIG` — React → Angular (lo que RECIBIMOS)

"La información verídica de cada departamento." Angular lo usa para pintar los badges.

```json
{
  "source": "cliente-react",
  "type": "CONFIG",
  "version": "1.0",
  "payload": {
    "deptos": [
      {
        "dbId": "65f2a9c8e4b1a3001f9d2c10",
        "piso": 1,
        "numero": 11,
        "estado": "VENDIDO",
        "titulo": "Apto-11",
        "disponibilidadText": "Vendido",
        "tipologia": "2 Ambientes",
        "precio": 185000
      },
      {
        "dbId": "65f2a9c8e4b1a3001f9d2c11",
        "piso": 7,
        "numero": 5,
        "estado": "RESERVADO"
      }
    ]
  }
}
```

#### Campos de cada depto (`DeptoExterno`)

| Campo | Tipo | Requerido | Qué hace en Angular |
|---|---|---|---|
| `dbId` | `string` | ✅ | Id en la DB del cliente. Se **guarda** (`apto.externo.dbId`) y se **devuelve en `DEPTO_SELECTED`** para que React ubique su registro sin buscar. |
| `piso` | `number \| string` | ✅ | **Clave de match 1**: se compara con `Floor.nombre` (nuestros pisos `1..21`). |
| `numero` | `number \| string` | ✅ | **Clave de match 2**: se compara con el número de nuestro `id` (`P1-Apto-11` → `11`). Además, **es el número que se muestra en el badge**: la etiqueta se arma como `piso-numero` → `"1-11"` (método `deptoNumero()` del overlay). |
| `estado` | `"DISPONIBLE" \| "RESERVADO" \| "VENDIDO"` | ✅ | **Colorea el badge**: se convierte en la clase `apto-badge disponible/reservado/vendido` → el punto circular queda **verde `#4ade80` / ámbar `#fbbf24` / rojo `#f87171`**. También afecta el cursor del path (`vendido` = `not-allowed`). Si el valor no es uno de los3 válidos, **se ignora** y se conserva el estado local. |
| `titulo` | `string` | – | Se guarda en `datosEstaticos.titulo`. Hoy **no tiene UI** (se eliminó el modal local de deptos en la rama experimental); queda en el modelo por si se necesita. |
| `disponibilidadText` | `string` | – | Se guarda en el depto (mismo caso: sin UI actual). |
| `tipologia` | `string` | – | Se guarda en el depto (sin UI actual). |
| *(campos extra)* | – | – | Cualquier campo adicional que manden se ignora sin romper nada (el modelo es extensible). |

#### Lógica de match y fallback (importante)

- El match es **`piso` + `numero`**. Ejemplo: `piso: 1, numero: 11` → nuestro depto `P1-Apto-11`.
- **Si un depto no viene en el `CONFIG`, conserva sus datos locales** (`data.json` + estados de Firestore). Es decir: pueden mandar **solo** los deptos que quieran sobreescribir, no hace falta la lista completa.
- **Sin `CONFIG`** (React no lo envió / red caída): la web funciona normal con sus datos locales — los badges nunca quedan vacíos.
- El `CONFIG` se reaplica **automáticamente** si Firestore actualiza los pisos (los overrides del padre siempre tienen prioridad).
- Dónde ocurre: `ParentBridgeService.parchearDeptos()` (match + pisa campos) y los `effect()` de `MainComponent` (aplica + refresca el piso visible para repintar).

---

### 3.3 `DEPTO_SELECTED` — Angular → React (lo que ENVIAMOS)

"El usuario tocó un departamento." Angular **no** abre ningún modal (fue eliminado);
solo notifica.

```json
{
  "source": "torre-angular",
  "type": "DEPTO_SELECTED",
  "version": "1.0",
  "payload": {
    "depto": {
      "dbId": "65f2a9c8e4b1a3001f9d2c10",
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

| Campo | Origen | Para qué le sirve a React |
|---|---|---|
| `dbId` | El que mandaron en `CONFIG` (si lo hubo) | Buscar el registro en su DB **sin parsing de ids** |
| `id` | Nuestro id interno (`"P{piso}-Apto-{n}"`) | Correlación/debug con nuestro lado |
| `piso` | `datosEstaticos.piso` | Número de piso como string (`"1"`) |
| `numero` | `externo.numero` o el de nuestro id | Número de depto como string (`"11"`) |
| `titulo` | `datosEstaticos.titulo` | Nombre a mostrar en su modal |
| `estado` | `estado` vigente (el del CONFIG si llegó) | Pintar disponibilidad en su modal |
| `badge` | Concatenación `piso-numero` | La etiqueta exacta que ve el usuario en el plano (`"1-11"`) |

**Desde dónde se emite** (cadena completa en nuestro código):

```
clic en el path SVG o en el badge (edificio-overlay.component.html)
  → (click)="apartmentSelected.emit(apto)"
  → MainComponent.onDeptoClick(apto)                    [main.component.ts:450]
  → ParentBridgeService.notificarDepto(apto)            [parent-bridge.service.ts:59]
  → window.parent.postMessage(mensajeDeptoSelected(...), parentOrigin)
```

**Condiciones**: solo se emite si `window.parent !== window` (modo embebido).
En la web abierta sola, el clic **no hace nada** (no hay modal local).

**Cuándo se dispara**: en cualquier estado de la app donde se vean los deptos
(plano del piso dentro del recorrido, cualquier piso 1..21).

---

## 4. Qué tienen que hacer los chicos de React (paso a paso)

### 4.0 Requisitos previos
- [ ] Nuestra web responde: `https://futurewebs.github.io/Arquitectos/home`
      (también sirve `https://futurewebs.github.io/Arquitectos/`, redirige a `/home`).
- [ ] Su CSP **no** bloquea el iframe (`frame-ancestors` debe incluir su propio dominio;
      GH Pages no envía `X-Frame-Options`, eso está verificado de nuestro lado).
- [ ] Definir `targetOrigin`/`e.origin` con los orígenes exactos (nunca `'*'` en producción).

### 4.1 Registrar el listener ANTES de crear el iframe
Si crean el iframe primero y suscriben `message` después, pueden perderse el
`APP_READY`. Suscriban primero (o manejen ambos órdenes — nuestro lado también
soporta recibir `CONFIG` sin `APP_READY`).

### 4.2 Ejemplo completo (React + TypeScript)

```tsx
import { useEffect, useRef, useState } from 'react';

const HIJA_ORIGIN = 'https://futurewebs.github.io';
// En desarrollo con el harness local: 'http://localhost:4300'

type DeptoSeleccionado = {
  dbId?: string;
  id: string;
  piso: string;
  numero: string;
  titulo: string;
  estado: string;
  badge: string;
};

export function Recorrido360() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [depto, setDepto] = useState<DeptoSeleccionado | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      // 1) Validar SIEMPRE el origen
      if (e.origin !== HIJA_ORIGIN) return;

      const msg = e.data;
      if (!msg || typeof msg.type !== 'string') return;

      // 2) La hija está lista → mandar la info verídica de los deptos
      if (msg.type === 'APP_READY') {
        e.source?.postMessage(
          {
            source: 'cliente-react',
            type: 'CONFIG',
            version: '1.0',
            payload: { deptos: deptosDeMiBase },   // mapear su modelo (ver 4.3)
          },
          HIJA_ORIGIN                                 // targetOrigin exacto
        );
      }

      // 3) Tocaron un depto en el plano → abrir NUESTRO modal
      if (msg.type === 'DEPTO_SELECTED') {
        setDepto(msg.payload.depto);
        setModalAbierto(true);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <>
      <iframe
        ref={iframeRef}
        src="https://futurewebs.github.io/Arquitectos/home"
        title="Recorrido 360"
        allow="fullscreen"
        style={{ width: '100%', height: '100%', border: 0 }}
      />
      {modalAbierto && depto && <MiModal depto={depto} onClose={() => setModalAbierto(false)} />}
    </>
  );
}
```

### 4.3 Mapear su modelo → `DeptoExterno`

```ts
// Ejemplo: su colección de deptos (ajustar a su modelo real)
function aDeptoExterno(d: MiDepto) {
  return {
    dbId: d.id,                 // su id de DB (obligatorio)
    piso: d.piso,               // número de piso   (obligatorio)
    numero: d.numero,           // número de depto  (obligatorio)
    estado: d.estado,           // 'DISPONIBLE' | 'RESERVADO' | 'VENDIDO'
    titulo: d.nombre,           // opcional
    // opcionales:
    tipologia: d.tipologia,
    precio: d.precio,
  };
}
```

> ⚠️ **Regla de match**: `piso` + `numero` deben coincidir con la numeración real
> del proyecto (pisos 1..21; deptos 1..17 en pisos 1-6, 1..7 en pisos 7-21).
> Si mandan solo algunos deptos, el resto se queda con nuestros datos locales.

### 4.4 Reenviar `CONFIG` cuando cambien datos
`CONFIG` es **idempotente**: cada vez que cambien estados/precios en su DB,
pueden volver a mandarlo con el mismo formato y los badges se repintan.

### 4.5 Casos borde a contemplar
| Caso | Comportamiento |
|---|---|
| El usuario toca un depto **sin** que haya llegado `CONFIG` | Se envía `DEPTO_SELECTED` igualmente (con la info local que tengamos); su `dbId` puede venir vacío → usar `id`/`piso`/`numero` como fallback |
| El iframe carga pero React no mandó `CONFIG` | La app funciona con sus datos locales |
| Varios iframes / otras ventanas | Angular **solo** acepta mensajes cuyo `event.source === window.parent` |
| `estado` inválido en `CONFIG` | Se ignora ese campo y se conserva el estado local |

---

## 5. Nuestra configuración (referencia)

```ts
// src/environments/environment.prod.ts  (build de deploy)
embed: {
  parentOrigin: "https://singapur-tower.skaleon.ai",          // targetOrigin al enviar
  allowedOrigins: ["https://singapur-tower.skaleon.ai"],       // orígenes aceptados
}

// src/environments/environment.ts  (desarrollo / harness local)
embed: {
  parentOrigin: "*",
  allowedOrigins: ["https://singapur-tower.skaleon.ai", "http://localhost:4400", "http://localhost:4200"],
}
```

`angular.json` → `configurations.production.fileReplacements` reemplaza
`environment.ts` por `environment.prod.ts` **solo en el build de producción**
(`npm run build`, el que usa el workflow de GitHub Pages).

---

## 6. Seguridad (reglas de ambos lados)

**Nosotros ya hacemos:**
1. Solo aceptamos mensajes con `event.source === window.parent`.
2. Solo aceptamos `event.origin` dentro de `allowedOrigins`.
3. Validamos la forma del mensaje (`esMensajeEmbed` + `esConfigMsg`): mensajes
   malformados se ignoran sin romper la app (probado).

**Ustedes deben hacer:**
1. Validar `e.origin === 'https://futurewebs.github.io'` antes de procesar.
2. Enviar con `targetOrigin` exacto (no `'*'`).
3. No hacer `JSON.parse(e.data)` — `postMessage` ya entrega objetos clonados;
   validen `msg.type` antes de usarlo.

---

## 7. Troubleshooting

| Síntoma | Causa probable | Solución |
|---|---|---|
| No llega `APP_READY` al padre | El listener se suscribió después de crear el iframe | Suscribir `message` antes de montar el iframe |
| No llega `CONFIG` a la hija | `targetOrigin` no coincide con `https://futurewebs.github.io`, o el `source`/`type`/`version` faltan | Revisar el objeto enviado y el targetOrigin |
| Los badges no cambian | `piso`/`numero` no coinciden con la numeración real, o `estado` inválido | Verificar el match (piso 1..21, números por piso); usar `badge: "1-11"` de la respuesta como referencia |
| El iframe muestra 404 | Usaron una URL que no existe en GH Pages | Usar exactamente `https://futurewebs.github.io/Arquitectos/home` (hay un stub `home/index.html` que redirige) |
| El iframe está en blanco / sin recursos | CSP de su sitio bloquea el frame o los assets | Permitir su propio origen en `frame-ancestors` |
| El modal no abre al tocar | Están escuchando otro `type` o el mensaje se descartó por origen | Loguear `e.origin` y `e.data.type` |

---

## 8. Cómo probarlo en local (nuestro harness)

Tenemos un banco de pruebas cross-origin listo:

- **Padre simulado**: `http://localhost:4400` — recibe `APP_READY`, manda `CONFIG`
  de prueba (`1-11 → VENDIDO`, `1-1 → RESERVADO`), loguea todo y envía mensajes
  malformados para verificar descarte.
- **Hija**: `http://localhost:4300` — build de desarrollo.
- **Scripts** (en la carpeta de herramientas `.cshot`):
  - `embed-test.js` → flujo completo (handshake → badges → `DEPTO_SELECTED` → standalone)
  - `embed-security.js` → build de producción: verifica que el origen no
    autorizado reciba **0 mensajes**.

Checklist de aceptación manual:
1. Abrir `localhost:4400` → en el log aparece `APP_READY` y luego `CONFIG enviado`.
2. Entrar al recorrido → piso 1 → el badge `1-11` está **rojo** y `1-1` **ámbar** (pintados por el CONFIG, no por nuestros datos).
3. Tocar `1-11` → el log muestra `DEPTO_SELECTED` con `"dbId":"db-101","badge":"1-11"`.
4. **No** se abre ningún modal de Angular.
5. Abrir `localhost:4300` directo (sin iframe) → el toque no rompe nada.

---

## 9. Estado de la rama (`experimental`)

- El modal local de deptos (`info-card` + tabs: Información/Galería/Planos/3D) fue
  **eliminado**: en modo embebido el clic solo notifica al padre.
- Protocolo, modelos y servicio: `src/app/models/embed-protocol.ts`,
  `src/app/services/parent-bridge.service.ts`.
- Commit de referencia: `refact` (contiene todo lo anterior + borrados).
