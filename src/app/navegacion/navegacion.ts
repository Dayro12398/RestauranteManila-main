import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CarritoService } from '../core/services/carrito.service';

interface CartelNav {
  id: string;
  label: string;
  ruta: string;
  exact?: boolean;
}

@Component({
  selector: 'app-navegacion',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navegacion.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './navegacion.css',
})
export class Navegacion {
  carritoService = inject(CarritoService);

  readonly carteles: CartelNav[] = [
    { id: 'inicio', label: 'Inicio', ruta: '/', exact: true },
    { id: 'comidas', label: 'Comidas', ruta: '/comidas' },
    { id: 'bebidas', label: 'Bebidas', ruta: '/bebidas' },
    { id: 'juego', label: 'Memo MANILA', ruta: '/juego' },
  ];

  menuAbierto = signal(false);

  alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }
}
