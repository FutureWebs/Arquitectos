import { Injectable } from '@angular/core';

/**
 * Precarga y retiene los pósters en memoria (una sola descarga por URL).
 * Al retener el HTMLImageElement resuelve dos problemas del flujo de transición:
 *  - la precarga ya no puede ser abortada por GC (que forzaba una 2da descarga)
 *  - el swap del <img> resuelve desde caché en memoria (sin red, sin flash)
 */
@Injectable({ providedIn: 'root' })
export class MediaPreloadService {

  private posters = new Map<string, Promise<HTMLImageElement>>();

  cargarPoster(url: string): Promise<HTMLImageElement> {
    const existente = this.posters.get(url);
    if (existente) return existente;

    const promesa = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          await img.decode();
        } catch {
          // decode() puede rechazar si la imagen se descartó; el load ya garantiza bytes
        }
        resolve(img);
      };
      img.onerror = () => reject(new Error(`No se pudo cargar el póster: ${url}`));
      img.src = url;
    }).catch((e) => {
      this.posters.delete(url);
      throw e;
    });

    this.posters.set(url, promesa);
    return promesa;
  }

  precargarPosters(urls: string[]) {
    for (const url of urls) {
      this.cargarPoster(url).catch(() => {});
    }
  }
}
