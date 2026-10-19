import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DATA_ENVIRONMENT } from '../data/data.environment';
import { TourStateService } from './tour-state.service';

describe('TourStateService', () => {
  let service: TourStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TourStateService);
  });

  /** Simula la reproducción completa del paso que está en curso. */
  const finishStep = (delay = 150) => {
    tick(delay);
    service.onVideoTimeUpdate(0.5);
    service.onVideoEnded();
  };

  it('arranca en la pantalla de inicio', () => {
    expect(service.scene()).toBe('inicio');
    expect(service.animating()).toBe(false);
    expect(service.stopId()).toBe(DATA_ENVIRONMENT.tour.startStop);
  });

  it('muestra el hotspot del edificio en la parada inicial', fakeAsync(() => {
    expect(service.hotspots().length).toBe(0);

    service.start();
    finishStep();

    expect(service.scene()).toBe('exterior');
    expect(service.hotspots().length).toBe(1);
    expect(service.hotspots()[0].building.id).toBe('cabana-1');
  }));

  it('avanza y retrocede entre paradas con el loop', fakeAsync(() => {
    service.start();
    finishStep();
    expect(service.scene()).toBe('exterior');
    expect(service.stopId()).toBe('A');

    service.rotate('next');
    finishStep();
    expect(service.stopId()).toBe('B');
    expect(service.animating()).toBe(false);

    service.rotate('next');
    finishStep();
    expect(service.stopId()).toBe('C');

    // Cierre del loop: desde C, "siguiente" vuelve a A.
    service.rotate('next');
    finishStep();
    expect(service.stopId()).toBe('A');

    service.rotate('prev');
    finishStep();
    expect(service.stopId()).toBe('C');
  }));

  it('entra a un edificio encadenando el video de aproximación y el de interior', fakeAsync(() => {
    service.start();
    finishStep();
    service.rotate('next');
    finishStep();
    expect(service.stopId()).toBe('B');

    service.enter('cabana-1');
    finishStep();
    expect(service.stopId()).toBe('A');

    finishStep();
    expect(service.scene()).toBe('interior');
    expect(service.activeBuildingId()).toBe('cabana-1');
    expect(service.modalOpen()).toBe(true);
    expect(service.hotspots().length).toBe(0);
  }));

  it('sale del interior y vuelve al inicio con los videos inversos', fakeAsync(() => {
    service.start();
    finishStep();
    service.enter('cabana-1');
    finishStep();
    expect(service.scene()).toBe('interior');

    service.closeModal();
    expect(service.modalOpen()).toBe(false);

    service.exit();
    finishStep();
    expect(service.scene()).toBe('exterior');
    expect(service.activeBuildingId()).toBeNull();
    expect(service.hotspots().length).toBe(1);

    service.back();
    finishStep();
    expect(service.scene()).toBe('inicio');
    expect(service.showBack()).toBe(false);
  }));

  it('ignora acciones mientras una transición está corriendo', fakeAsync(() => {
    service.start();
    expect(service.animating()).toBe(true);

    service.rotate('next');
    service.enter('cabana-1');
    service.back();

    finishStep();
    expect(service.scene()).toBe('exterior');
    expect(service.stopId()).toBe('A');
  }));
});
