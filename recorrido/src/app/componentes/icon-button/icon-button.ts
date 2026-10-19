import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type IconButtonVariant = 'solid' | 'glass' | 'nav';

/**
 * Botón cuadrado reutilizable con ícono Material.
 * Se usa para fullscreen, volver, cerrar y las flechas del recorrido.
 */
@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './icon-button.html',
  styleUrl: './icon-button.css',
})
export class IconButton {
  @Input({ required: true }) icon = 'star';
  @Input() label = '';
  @Input() variant: IconButtonVariant = 'solid';
  @Input() disabled = false;
  @Output() pressed = new EventEmitter<MouseEvent>();
}
