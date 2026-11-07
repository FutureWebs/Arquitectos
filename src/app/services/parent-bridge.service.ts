import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Apartment, Floor } from '../models/building.models';
import {
  ConfigPayload,
  DeptoExterno,
  DeptoSeleccionado,
  ESTADOS_VALIDOS,
  TIPO_MENSAJE,
  claveDepto,
  esConfigMsg,
  esMensajeEmbed,
  mensajeAppReady,
  mensajeDeptoSelected,
  numeroDeId,
} from '../models/embed-protocol';

/**
 * Puente de comunicación con la web padre (iframe React).
 *
 * - Recibe { type: 'CONFIG' } con la info verídica de cada depto y la aplica
 *   a nuestros pisos (match por piso + número).
 * - Envía { type: 'APP_READY' } al iniciar y { type: 'DEPTO_SELECTED' } al
 *   clickear un depto, para que el padre abra SU modal.
 *
 * Seguridad: solo acepta mensajes que llegan exactamente de window.parent,
 * con un origen dentro de la allowlist de environment.embed y con forma
 * válida de mensaje del protocolo (ver embed-protocol.ts).
 */
@Injectable({ providedIn: 'root' })
export class ParentBridgeService {

  /** Info verídica recibida del padre (null mientras no llegue el CONFIG). */
  deptosExternos = signal<DeptoExterno[] | null>(null);

  /** Se incrementa con cada CONFIG recibido (para refrescar la vista). */
  configVersion = signal(0);

  constructor() {
    window.addEventListener('message', this.onMensaje);
  }

  /** ¿Estamos dentro del iframe de la web padre? */
  esEmbebido(): boolean {
    try {
      return !!window.parent && window.parent !== window;
    } catch {
      return true;
    }
  }

  /** Hija → Padre: "estoy lista, podés mandarme el CONFIG". */
  avisarListo(): void {
    if (!this.esEmbebido()) return;
    window.parent.postMessage(mensajeAppReady(), this.parentOrigin());
  }

  /** Hija → Padre: depto clickeado (el padre abre su modal). */
  notificarDepto(apto: Apartment): void {
    if (!this.esEmbebido()) return;
    const numero = String(apto.externo?.numero ?? numeroDeId(apto.id));
    const snapshot: DeptoSeleccionado = {
      dbId: apto.externo?.dbId,
      id: apto.id,
      piso: apto.datosEstaticos.piso,
      numero,
      titulo: apto.datosEstaticos.titulo,
      estado: apto.estado,
      badge: `${apto.datosEstaticos.piso}-${numero}`,
    };
    window.parent.postMessage(mensajeDeptoSelected(snapshot), this.parentOrigin());
  }

  /**
   * Parchea los pisos con la info del padre (match por piso + número).
   * Idempotente: si Firestore reemplaza los pisos, el effect del MainComponent
   * vuelve a llamar esto y los overrides externos vuelven a aplicarse.
   */
  parchearDeptos(pisos: Floor[], deptos: DeptoExterno[]): void {
    const porClave = new Map<string, DeptoExterno>();
    for (const d of deptos) {
      if (d && d.piso != null && d.numero != null) {
        porClave.set(claveDepto(d.piso, d.numero), d);
      }
    }
    if (!porClave.size) return;

    for (const piso of pisos) {
      const pN = Number(piso.nombre);
      if (Number.isNaN(pN)) continue;
      for (const apto of piso.apartamentos) {
        const ext = porClave.get(claveDepto(pN, numeroDeId(apto.id)));
        if (!ext) continue;

        if (ESTADOS_VALIDOS.includes(ext.estado)) {
          apto.estado = ext.estado;
        }
        if (typeof ext.disponibilidadText === 'string') {
          apto.disponibilidadText = ext.disponibilidadText;
        }
        if (typeof ext.titulo === 'string') {
          apto.datosEstaticos.titulo = ext.titulo;
        }
        if (typeof ext.tipologia === 'string') {
          apto.datosEstaticos.tipologia = ext.tipologia;
        }
        apto.externo = { dbId: ext.dbId, numero: ext.numero };
      }
    }
  }

  private parentOrigin(): string {
    return environment.embed?.parentOrigin || '*';
  }

  private onMensaje = (event: MessageEvent): void => {
    // Solo mensajes provenientes de nuestro iframe padre
    if (!this.esEmbebido() || event.source !== window.parent) return;

    const allowed = environment.embed?.allowedOrigins ?? ['*'];
    if (!allowed.includes('*') && !allowed.includes(event.origin)) return;

    if (!esMensajeEmbed(event.data)) return;

    if (event.data.type === TIPO_MENSAJE.CONFIG && esConfigMsg(event.data)) {
      const payload = event.data.payload as ConfigPayload;
      this.deptosExternos.set(payload.deptos);
      this.configVersion.update((v) => v + 1);
    }
  };
}
