import { Component, ElementRef, ViewChild, signal, computed, inject, ChangeDetectorRef, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { EdificioOverlay } from '../edificio-overlay/edificio-overlay.component';
import { BuildingDataService } from '../../services/building-data.service';
import { Apartment, Floor } from '../../models/building.models';
import { TranslatePipe } from '@ngx-translate/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { InfoCard } from '../info-card/info-card';
import { GalleryCarouselComponent } from '../gallery-carousel/gallery-carousel.component';
import { InfoDepto } from '../../models/info-depto';

type AppState = 'INICIO' | 'NAVEGANDO_360' | 'ADENTRO';
type Perspectiva = 'FRENTE' | 'DERECHA' | 'IZQUIERDA';

interface VideoStep {
  video: string;
  poster: string;
  targetState: AppState;
  targetPerspectiva: Perspectiva;
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, TopBarComponent, EdificioOverlay, TranslatePipe, SidenavComponent, InfoCard, GalleryCarouselComponent],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  private buildingService = inject(BuildingDataService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('mainVideo') videoElement!: ElementRef<HTMLVideoElement>;

  private pathVideos = 'videos/';
  private pathFotos = 'fotos/';

  isSidenavOpen = signal<boolean>(false);
  estadoActual = signal<AppState>('INICIO');
  perspectivaActual = signal<Perspectiva>('FRENTE');
  isAnimating = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  isVideoPlaying = signal<boolean>(false);
  isFullscreen = signal<boolean>(false);

  // Obtenemos los pisos sincronizados desde el servicio (JSON + Firebase)
  edificioCompleto = this.buildingService.edificioPisos;
  pisoActual = signal<Floor | null>(null);

  currentPoster = signal<string>(`${this.pathFotos}intro.webp`);
  currentVideoUrl = signal<string>('');

  mostrarInfo = false;
  svgInfo = false;
  infoSeleccionada!: InfoDepto;

  mostrarOverlay = computed(() => this.estadoActual() === 'ADENTRO' && !this.isAnimating());

  // Contornos clickeables del edificio por perspectiva (coords en lienzo 1920x1080)
  private readonly contornosEdificio: Record<Perspectiva, { d: string; x: number; y: number }> = {
    FRENTE: {
      d: 'M245.513 0.511078L287.513 10.5111V43.5111L337.013 51.0111L319.513 692.011L131.013 800.011L21.0129 746.511L0.512878 76.0111L176.513 43.5111V13.5111L245.513 0.511078Z',
      x: 783, y: 127
    },
    DERECHA: {
      d: 'M342.015 11.5069L261.515 0.506927L217.515 9.50693V26.5069L107.515 7.50693L0.514542 26.5069L22.5145 669.507L231.015 766.507L317.515 721.007L342.015 11.5069Z',
      x: 789, y: 151
    },
    IZQUIERDA: {
      d: 'M47.0206 15.5108V49.5108L0.520599 42.0108L22.5206 682.011L121.021 738.011V766.511L136.021 760.011L173.021 780.511L325.521 692.511L344.521 18.5108L233.021 0.510803L169.521 11.0108L120.021 0.510803L47.0206 15.5108Z',
      x: 783, y: 162
    }
  };

  contornoEdificio = computed(() => this.contornosEdificio[this.perspectivaActual()]);

  mostrarZonaEntrada = computed(() => this.estadoActual() === 'NAVEGANDO_360' && !this.isAnimating());

  zonaHover = signal<boolean>(false);
  mobileConfirmado = signal<boolean>(false);
  private esTactil = window.matchMedia('(hover: none)').matches;

  // Carrusel de renders (botón Galería)
  galeriaAbierta = signal<boolean>(false);
  tourAbierto = signal<boolean>(false);
  videosAbiertos = signal<boolean>(false);
  readonly imagenesRender: string[] = [
    'fotos/galeria-general/A-Render Principal Modificado (2).webp',
    'fotos/galeria-general/B-Render Secundario Modificado (1).webp',
    'fotos/galeria-general/C-Render Peatonal (1) (1).webp',
    'fotos/galeria-general/Copia de D-Render Terraza (1) (1).webp',
    'fotos/galeria-general/Copia de F-Render Interiro Quincho (1) (1).webp',
    'fotos/galeria-general/AP-IMG-3-v2-FULL-SIZE.webp',
    'fotos/galeria-general/T4 004 (1) (1).webp',
    'fotos/galeria-general/alto p ia 2-expanded.webp'
  ];

  // Tour 360 (menú hamburguesa) y videos del menú
  readonly imagenesTour360: string[] = [
    'fotos/tour360/Planta Monoambiaente.webp',
    'fotos/tour360/Planta Monoambiaente_A01.webp',
    'fotos/tour360/Planta Monoambiaente_B01.webp',
    'fotos/tour360/Planta Dpto 1 Dormitorio_A01.webp',
    'fotos/tour360/Planta Dpto 1 Dormitorio_A02.webp',
    'fotos/tour360/Planta Dpto 2 Dormitorios A01.webp',
    'fotos/tour360/Planta Dpto 2 Dormitorios A02.webp',
    'fotos/tour360/Planta Dpto 2 Dormitorios_B01.webp',
    'fotos/tour360/Planta Dpto 2 Dormitorios_B02.webp'
  ];

  readonly videosMenu: string[] = [
    'videos/videos-menu/ALTO PANORAMA T4 ANIMACION.mp4',
    'videos/videos-menu/ALTO PANORAMA T4 ANIMACION VERTICAL.mp4',
    'videos/videos-menu/Alto Panorama - video showroom (2).mp4'
  ];

  // Video inicial de fondo (inicial_web.mp4): visible siempre que se esté en INICIO
  // Oculto temporalmente (sin borrar nada): poner en true para restaurarlo
  private readonly introVideoActivo: boolean = false;
  mostrarIntroVideo = computed(() =>
    this.introVideoActivo && this.estadoActual() === 'INICIO' && !this.isVideoPlaying()
  );

  onIntroCanPlay(video: HTMLVideoElement) {
    if (video.paused) {
      video.muted = true;
      video.play().catch(() => {});
    }
  }

  // Recomendación de orientación (solo mobile) al llegar al top
  recomendacionOrientacion = signal<boolean>(false);
  private recomendacionTimer: ReturnType<typeof setTimeout> | null = null;

  private mostrarRecomendacionOrientacion() {
    this.recomendacionOrientacion.set(true);
    if (this.recomendacionTimer) clearTimeout(this.recomendacionTimer);
    this.recomendacionTimer = setTimeout(() => {
      this.recomendacionOrientacion.set(false);
      this.recomendacionTimer = null;
    }, 6000);
  }

  private cancelarRecomendacionOrientacion() {
    if (this.recomendacionTimer) {
      clearTimeout(this.recomendacionTimer);
      this.recomendacionTimer = null;
    }
    this.recomendacionOrientacion.set(false);
  }

  constructor() {

    effect(() => {
      const pisos = this.edificioCompleto();
      if (pisos.length > 0 && !this.pisoActual()) {
        const pisoDefault = pisos.find(f => f.nombre === 'T2') || pisos[0];
        this.pisoActual.set(pisoDefault);
      }
    });

    effect(() => {
      const llegoAlTop = this.mostrarOverlay();
      const enPortrait = window.matchMedia('(orientation: portrait)').matches;
      if (llegoAlTop && this.esTactil && enPortrait) {
        this.mostrarRecomendacionOrientacion();
      } else {
        this.cancelarRecomendacionOrientacion();
      }
    });

    // Si el usuario gira el teléfono, la recomendación ya cumplió: ocultar
    window.matchMedia('(orientation: portrait)').addEventListener('change', (e) => {
      if (!e.matches) this.cancelarRecomendacionOrientacion();
    });

  }

  ngOnInit() {
    const img = new Image();
    img.onload = () => setTimeout(() => this.isLoading.set(false), 400);
    img.onerror = () => this.isLoading.set(false);
    img.src = this.currentPoster();
  }

  abrirMenuPrincipal() {
    this.isSidenavOpen.set(true);
  }



  // --- MÉTODOS DE VIDEO Y NAVEGACIÓN (Se mantienen igual) ---
  private ejecutarSecuencia(pasos: VideoStep[]) {
    if (this.isAnimating()) return;
    this.zonaHover.set(false);
    this.mobileConfirmado.set(false);
    this.videoQueue = pasos;
    this.isAnimating.set(true);
    this.reproducirSiguienteDeLaCola();
  }

  private preloadImage(url: string) {
    const img = new Image();
    img.src = url;
  }

  private reproducirSiguienteDeLaCola() {
    if (this.videoQueue.length === 0) {
      this.isAnimating.set(false);
      this.isVideoPlaying.set(false);
      this.pasoEnReproduccion = null;
      return;
    }

    this.pasoEnReproduccion = this.videoQueue.shift()!;
    this.targetPosterForEnd = `${this.pathFotos}${this.pasoEnReproduccion.poster}`;

    this.isVideoPlaying.set(false);
    this.esperandoInicioVideo = true;

    this.preloadImage(this.targetPosterForEnd);

    // Asignamos la nueva URL del video inmediatamente
    this.currentVideoUrl.set(`${this.pathVideos}${this.pasoEnReproduccion.video}`);
    this.esperandoInicioVideo = true;
    this.cdr.detectChanges();

    if (this.videoElement) {
      const videoNode = this.videoElement.nativeElement;
      videoNode.currentTime = 0; // Aseguramos que empiece desde el inicio

      videoNode.play().then(() => {
        // El video arrancó con éxito, actualizamos la perspectiva de inmediato
        if (this.pasoEnReproduccion) {
          this.perspectivaActual.set(this.pasoEnReproduccion.targetPerspectiva);
        }
      }).catch(e => console.error('Autoplay bloqueado o error al reproducir:', e));
    }
  }

  onVideoTimeUpdate() {
    if (!this.esperandoInicioVideo || !this.videoElement || !this.pasoEnReproduccion) return;

    // Apenas el video emite su primer fotograma real (currentTime > 0.001),
    // ocultamos la foto estática de inmediato para revelar el video sin demora.
    if (this.videoElement.nativeElement.currentTime > 0.001) {
      this.esperandoInicioVideo = false;
      this.isVideoPlaying.set(true); // Esto quita la clase .hidden al video y la oculta al poster

      if (this.posterTimeoutRef) clearTimeout(this.posterTimeoutRef);
    }
  }

  onVideoEnded() {
    if (this.pasoEnReproduccion) {
      // ANTES de cambiar el estado, fijamos la foto póster actual para que
      // tape el video justo en el fotograma final exacto.
      this.currentPoster.set(this.targetPosterForEnd);
      this.isVideoPlaying.set(false); // Oculta el video instantáneamente mostrando la foto abajo
      this.estadoActual.set(this.pasoEnReproduccion.targetState);
    }

    // Pasamos al siguiente paso en la cola sin esperas
    this.reproducirSiguienteDeLaCola();
  }

  iniciarDescubrimiento() {
    this.ejecutarSecuencia([
      { video: 'intro.mp4', poster: 'home.webp', targetState: 'NAVEGANDO_360', targetPerspectiva: 'FRENTE' }
    ]);
  }

  girarDerecha() {
    if (this.perspectivaActual() === 'FRENTE') {
      this.ejecutarSecuencia([{ video: 'home_derecha.mp4', poster: 'home_derecha.webp', targetState: 'NAVEGANDO_360', targetPerspectiva: 'DERECHA' }]);
    } else if (this.perspectivaActual() === 'IZQUIERDA') {
      this.ejecutarSecuencia([{ video: 'home_izquierda_reverse.mp4', poster: 'home.webp', targetState: 'NAVEGANDO_360', targetPerspectiva: 'FRENTE' }]);
    } else if (this.perspectivaActual() === 'DERECHA') {
      this.ejecutarSecuencia([{ video: 'derecha_izquierda.mp4', poster: 'home_izquierda.webp', targetState: 'NAVEGANDO_360', targetPerspectiva: 'IZQUIERDA' }]);
    }
  }

  girarIzquierda() {
    if (this.perspectivaActual() === 'FRENTE') {
      this.ejecutarSecuencia([{ video: 'home_izquierda.mp4', poster: 'home_izquierda.webp', targetState: 'NAVEGANDO_360', targetPerspectiva: 'IZQUIERDA' }]);
    } else if (this.perspectivaActual() === 'DERECHA') {
      this.ejecutarSecuencia([{ video: 'home_derecha_reverse.mp4', poster: 'home.webp', targetState: 'NAVEGANDO_360', targetPerspectiva: 'FRENTE' }]);
    } else if (this.perspectivaActual() === 'IZQUIERDA') {
      this.ejecutarSecuencia([{ video: 'izquierda_derecha.mp4', poster: 'home_derecha.webp', targetState: 'NAVEGANDO_360', targetPerspectiva: 'DERECHA' }]);
    }
  }

  entrarEdificio() {
    const sequence: VideoStep[] = [];
    if (this.perspectivaActual() === 'DERECHA') {
      sequence.push({ video: 'home_derecha_reverse.mp4', poster: 'home.webp', targetState: 'NAVEGANDO_360', targetPerspectiva: 'FRENTE' });
    } else if (this.perspectivaActual() === 'IZQUIERDA') {
      sequence.push({ video: 'home_izquierda_reverse.mp4', poster: 'home.webp', targetState: 'NAVEGANDO_360', targetPerspectiva: 'FRENTE' });
    }
    sequence.push({ video: 'top.mp4', poster: 'top.webp', targetState: 'ADENTRO', targetPerspectiva: 'FRENTE' });
    const pisos = this.edificioCompleto();
    if (pisos.length > 0) {
      const pisoDefault = pisos.find(f => f.nombre === 'T2') || pisos[0];
      this.pisoActual.set(pisoDefault);
    }
    this.ejecutarSecuencia(sequence);
  }

  onEdificioClick() {
    if (this.esTactil && !this.mobileConfirmado()) {
      this.mobileConfirmado.set(true);
      return;
    }
    this.entrarEdificio();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event) {
    if (!this.mobileConfirmado()) return;
    const el = e.target as Element | null;
    if (el && el.closest('.zona-entrada')) return;
    this.mobileConfirmado.set(false);
    this.zonaHover.set(false);
  }

  volverAtras() {
    const sequence: VideoStep[] = [];
    if (this.estadoActual() === 'ADENTRO') {
      sequence.push({ video: 'top_reverse.mp4', poster: 'home.webp', targetState: 'NAVEGANDO_360', targetPerspectiva: 'FRENTE' });
    } else if (this.estadoActual() === 'NAVEGANDO_360') {
      if (this.perspectivaActual() === 'DERECHA') {
        sequence.push({ video: 'home_derecha_reverse.mp4', poster: 'home.webp', targetState: 'NAVEGANDO_360', targetPerspectiva: 'FRENTE' });
      } else if (this.perspectivaActual() === 'IZQUIERDA') {
        sequence.push({ video: 'home_izquierda_reverse.mp4', poster: 'home.webp', targetState: 'NAVEGANDO_360', targetPerspectiva: 'FRENTE' });
      }
      sequence.push({ video: 'intro_reverse.mp4', poster: 'intro.webp', targetState: 'INICIO', targetPerspectiva: 'FRENTE' });
    }
    this.ejecutarSecuencia(sequence);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        this.isFullscreen.set(true);
      }).catch(e => console.error(e));
    } else {
      document.exitFullscreen().then(() => {
        this.isFullscreen.set(false);
      });
    }
  }

  // Al seleccionar un apartamento, cargamos sus datos estáticos y el estado actualizado
  abrirDetalle(apto: Apartment) {
    this.svgInfo = true;
    this.mostrarInfo = true;
    this.infoSeleccionada = {
      ...apto.datosEstaticos,
      disponibilidad: apto.disponibilidadText || apto.estado
    };
  }

  abrirInfo() {
    this.mostrarInfo = true;
  }

  cerrarInfo() {
    this.mostrarInfo = false;
  }

  // Método dedicado para manejar el cambio de piso seleccionado
  onFloorChanged(nuevoPiso: Floor) {
    this.pisoActual.set({ ...nuevoPiso });
    this.cdr.detectChanges(); // Forzamos la detección de cambios
  }

  private targetPosterForEnd: string = '';
  private esperandoInicioVideo = false;
  private videoQueue: VideoStep[] = [];
  private pasoEnReproduccion: VideoStep | null = null;
  private posterTimeoutRef: any;
}
