import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  ViewChild,
} from '@angular/core';
import { MediaImage } from '../../media-image/media-image';
import { BuildingPlan } from '../../../models/environment.models';

/** Pestaña "Planos": visor con zoom (rueda/pellizco) y arrastre. */
@Component({
  selector: 'app-planos',
  standalone: true,
  imports: [MediaImage],
  templateUrl: './planos.html',
  styleUrl: './planos.css',
})
export class Planos implements AfterViewInit, OnChanges {
  @Input() planos: BuildingPlan[] = [];
  @Input() emptyLabel = 'No hay plano disponible';

  @ViewChild('viewer') private viewerRef?: ElementRef<HTMLDivElement>;

  activeIndex = 0;

  private scale = 1;
  private posX = 0;
  private posY = 0;
  private isDragging = false;
  private lastX = 0;
  private lastY = 0;

  ngOnChanges(): void {
    if (this.activeIndex >= this.planos.length) this.activeIndex = 0;
    this.resetView();
  }

  ngAfterViewInit(): void {
    const element = this.viewerRef?.nativeElement;
    if (!element) return;

    element.addEventListener('wheel', this.onWheel, { passive: false });
    element.addEventListener('mousedown', this.onMouseDown);
    element.addEventListener('mousemove', this.onMouseMove);
    element.addEventListener('mouseup', this.onMouseUp);
    element.addEventListener('mouseleave', this.onMouseUp);
    element.addEventListener('touchstart', this.onTouchStart, { passive: false });
    element.addEventListener('touchmove', this.onTouchMove, { passive: false });
    element.addEventListener('touchend', this.onTouchEnd);
    element.addEventListener('dblclick', this.onDoubleClick);
  }

  select(index: number): void {
    this.activeIndex = index;
    this.resetView();
  }

  private updateTransform(): void {
    const canvas = this.viewerRef?.nativeElement.querySelector<HTMLElement>('.planos-canvas');
    if (canvas) {
      canvas.style.transform = `translate(${this.posX}px, ${this.posY}px) scale(${this.scale})`;
    }
  }

  private resetView(): void {
    this.scale = 1;
    this.posX = 0;
    this.posY = 0;
    this.updateTransform();
  }

  private onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    this.scale = Math.min(Math.max(this.scale + delta, 0.5), 5);
    this.updateTransform();
  };

  private onMouseDown = (event: MouseEvent): void => {
    this.isDragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    if (this.viewerRef) this.viewerRef.nativeElement.style.cursor = 'grabbing';
  };

  private onMouseMove = (event: MouseEvent): void => {
    if (!this.isDragging) return;
    this.posX += event.clientX - this.lastX;
    this.posY += event.clientY - this.lastY;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.updateTransform();
  };

  private onMouseUp = (): void => {
    this.isDragging = false;
    if (this.viewerRef) this.viewerRef.nativeElement.style.cursor = 'grab';
  };

  private onTouchStart = (event: TouchEvent): void => {
    if (event.touches.length === 1) {
      this.isDragging = true;
      this.lastX = event.touches[0].clientX;
      this.lastY = event.touches[0].clientY;
    }
  };

  private onTouchMove = (event: TouchEvent): void => {
    if (event.touches.length === 2) {
      event.preventDefault();
      const distance = this.getPinchDistance(event);
      if (this.lastPinchDist > 0) {
        const ratio = distance / this.lastPinchDist;
        this.scale = Math.min(Math.max(this.scale * ratio, 0.5), 5);
        this.updateTransform();
      }
      this.lastPinchDist = distance;
      return;
    }

    if (event.touches.length === 1 && this.isDragging) {
      this.posX += event.touches[0].clientX - this.lastX;
      this.posY += event.touches[0].clientY - this.lastY;
      this.lastX = event.touches[0].clientX;
      this.lastY = event.touches[0].clientY;
      this.updateTransform();
    }
  };

  private onTouchEnd = (): void => {
    this.isDragging = false;
    this.lastPinchDist = 0;
  };

  private onDoubleClick = (): void => {
    this.resetView();
  };

  private lastPinchDist = 0;

  private getPinchDistance(event: TouchEvent): number {
    const dx = event.touches[0].clientX - event.touches[1].clientX;
    const dy = event.touches[0].clientY - event.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
