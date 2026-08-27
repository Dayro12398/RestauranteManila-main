import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CarritoService } from '../core/services/carrito.service';

@Component({
  selector: 'app-navegacion',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navegacion.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './navegacion.css',
})
export class Navegacion {
  carritoService = inject(CarritoService);
}
