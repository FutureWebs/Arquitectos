import { Component, ElementRef, ViewChild, signal, computed, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { EdificioOverlay } from '../edificio-overlay/edificio-overlay.component';
import { EDIFICIO_COMPLETO } from '../../data/edificio.mock';
import { Apartment, Floor } from '../../models/building.models';
import {TranslatePipe} from '@ngx-translate/core';
import {SidenavComponent} from '../sidenav/sidenav.component';
import {InfoCard} from '../info-card/info-card';
import {InfoDepto} from '../../models/info-depto';

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
  imports: [CommonModule, TopBarComponent, EdificioOverlay, TranslatePipe, SidenavComponent, InfoCard],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {

  protected infoTest: InfoDepto = {
    balcon: false,
    banios: 0,
    cochera: false,
    disponibilidad: '',
    dormitorios: 0,
    edificio: '',
    fotoTitulo: '',
    imagenes: [],
    lavadero: false,
    metrosCuadrados: 0,
    piso: '',
    plano: '',
    planta3D: '',
    precio: 0,
    tipologia: '',
    titulo: ''
  };


  private cdr = inject(ChangeDetectorRef);
  @ViewChild('mainVideo') videoElement!: ElementRef<HTMLVideoElement>;

  private pathVideos = 'mobile/vuelo/videos/';
  private pathFotos = 'mobile/vuelo/fotos/';

  isSidenavOpen = signal<boolean>(false);

  estadoActual = signal<AppState>('INICIO');
  perspectivaActual = signal<Perspectiva>('FRENTE');
  isAnimating = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  isVideoPlaying = signal<boolean>(false);
  isFullscreen = signal<boolean>(false);

  edificioCompleto = EDIFICIO_COMPLETO;
  pisoActual = signal<Floor>(EDIFICIO_COMPLETO.find(f => f.nombre === 'T2') || EDIFICIO_COMPLETO[0]);

  currentPoster = signal<string>(`${this.pathFotos}intro.webp`);
  currentVideoUrl = signal<string>('');

  mostrarInfo = false;
  svgInfo = false;

  mostrarOverlay = computed(() => this.estadoActual() === 'ADENTRO' && !this.isAnimating());

  private targetPosterForEnd: string = '';
  private esperandoInicioVideo = false;
  private videoQueue: VideoStep[] = [];
  private pasoEnReproduccion: VideoStep | null = null;
  private posterTimeoutRef: any;

  ngOnInit() {
    const img = new Image();
    img.onload = () => setTimeout(() => this.isLoading.set(false), 400);
    img.onerror = () => this.isLoading.set(false);
    img.src = this.currentPoster();
  }

  abrirMenuPrincipal() {
    this.isSidenavOpen.set(true);
  }

  // --- ACCIONES DE VIDEOS Y SECUENCIAS ---
  private ejecutarSecuencia(pasos: VideoStep[]) {
    if (this.isAnimating()) return;
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

    setTimeout(() => {
      if (this.pasoEnReproduccion) {
        this.currentVideoUrl.set(`${this.pathVideos}${this.pasoEnReproduccion.video}`);
        this.cdr.detectChanges();

        if (this.videoElement) {
          this.videoElement.nativeElement.play().catch(e => console.error('Autoplay bloqueado:', e));
        }
      }
    }, 150);
  }

  onVideoTimeUpdate() {
    if (!this.esperandoInicioVideo || !this.videoElement || !this.pasoEnReproduccion) return;

    if (this.videoElement.nativeElement.currentTime > 0.02) {
      this.esperandoInicioVideo = false;
      this.isVideoPlaying.set(true);
      this.perspectivaActual.set(this.pasoEnReproduccion.targetPerspectiva);

      if (this.posterTimeoutRef) clearTimeout(this.posterTimeoutRef);
      this.posterTimeoutRef = setTimeout(() => {
        this.currentPoster.set(this.targetPosterForEnd);
      }, 600);
    }
  }

  onVideoEnded() {
    if (this.pasoEnReproduccion) {
      this.estadoActual.set(this.pasoEnReproduccion.targetState);
    }
    this.isVideoPlaying.set(false);
    this.reproducirSiguienteDeLaCola();
  }

  // --- BOTONES Y NAVEGACIÓN ---
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
    this.ejecutarSecuencia(sequence);
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


  abrirDetalle(apto: Apartment) {

    this.svgInfo = true;
    this.mostrarInfo = true;
    this.infoTest = apto.datos;
  }
  abrirInfo() {
    this.mostrarInfo = true;
  }
  cerrarInfo() {
    this.mostrarInfo = false;
  }

}
