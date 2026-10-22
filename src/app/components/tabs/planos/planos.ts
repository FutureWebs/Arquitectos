import { Component, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-planos',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './planos.html',
  styleUrl: './planos.css'
})
export class Planos implements AfterViewInit {
  @Input() plano: string = '';
  @ViewChild('viewer') viewerRef!: ElementRef<HTMLDivElement>;

  private scale = 1;
  private posX = 0;
  private posY = 0;
  private lastPinchDist = 0;
  private isDragging = false;
  private lastX = 0;
  private lastY = 0;

  ngAfterViewInit() {
    if (!this.viewerRef) return;
    const el = this.viewerRef.nativeElement;

    el.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    el.addEventListener('mousedown', this.onMouseDown.bind(this));
    el.addEventListener('mousemove', this.onMouseMove.bind(this));
    el.addEventListener('mouseup', this.onMouseUp.bind(this));
    el.addEventListener('mouseleave', this.onMouseUp.bind(this));
    el.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    el.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    el.addEventListener('touchend', this.onTouchEnd.bind(this));
    el.addEventListener('dblclick', this.onDoubleClick.bind(this));
  }

  private updateTransform() {
    const img = this.viewerRef?.nativeElement.querySelector('img');
    if (img) {
      img.style.transform = `translate(${this.posX}px, ${this.posY}px) scale(${this.scale})`;
    }
  }

  private onWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    this.scale = Math.min(Math.max(this.scale + delta, 0.5), 5);
    this.updateTransform();
  }

  private onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.viewerRef.nativeElement.style.cursor = 'grabbing';
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    this.posX += e.clientX - this.lastX;
    this.posY += e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.updateTransform();
  }

  private onMouseUp() {
    this.isDragging = false;
    if (this.viewerRef) {
      this.viewerRef.nativeElement.style.cursor = 'grab';
    }
  }

  private onTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      e.preventDefault();
      this.lastPinchDist = this.getPinchDistance(e);
    } else if (e.touches.length === 1) {
      this.isDragging = true;
      this.lastX = e.touches[0].clientX;
      this.lastY = e.touches[0].clientY;
    }
  }

  private onTouchMove(e: TouchEvent) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = this.getPinchDistance(e);
      const delta = (dist - this.lastPinchDist) * 0.01;
      this.scale = Math.min(Math.max(this.scale + delta, 0.5), 5);
      this.lastPinchDist = dist;
      this.updateTransform();
    } else if (e.touches.length === 1 && this.isDragging) {
      this.posX += e.touches[0].clientX - this.lastX;
      this.posY += e.touches[0].clientY - this.lastY;
      this.lastX = e.touches[0].clientX;
      this.lastY = e.touches[0].clientY;
      this.updateTransform();
    }
  }

  private onTouchEnd() {
    this.isDragging = false;
  }

  private onDoubleClick() {
    this.scale = 1;
    this.posX = 0;
    this.posY = 0;
    this.updateTransform();
  }

  private getPinchDistance(e: TouchEvent): number {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
