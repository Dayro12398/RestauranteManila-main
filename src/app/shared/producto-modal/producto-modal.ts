import { Component, ChangeDetectionStrategy, EventEmitter, Input, Output } from '@angular/core';
import { DecimalPipe } from '@angular/common';

export interface ProductoModalVM {
  id: string;
  nombre: string;
  imagen: string;
  categoria?: string;
  alcoholica?: boolean;
  precio: number;
  ingredientes: string[];
}

@Component({
  selector: 'app-producto-modal',
  imports: [DecimalPipe],
  templateUrl: './producto-modal.html',
  styleUrl: './producto-modal.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ProductoModal {
  @Input({ required: true }) producto!: ProductoModalVM;
  @Input() descripcion = '';
  @Input() cargando = false;
  @Input() saliendo = false;
  @Input() enLlamas = false;
  @Input() agregadoOk = false;

  @Output() cerrar = new EventEmitter<void>();
  @Output() agregar = new EventEmitter<void>();

  detenerPropagacion(evento: Event): void {
    evento.stopPropagation();
  }
}
