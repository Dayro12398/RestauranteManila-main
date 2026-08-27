import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { MealService } from '../core/services/meal.service';
import { CarritoService } from '../core/services/carrito.service';
import { MealCard, MealCategory } from '../core/models/meal.model';

@Component({
  selector: 'app-comidas',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './comidas.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './comidas.css',
})
export class Comidas implements OnInit {
  private mealService = inject(MealService);
  private carritoService = inject(CarritoService);

  busquedaNombre = '';
  busquedaIngrediente = '';

  categorias = signal<MealCategory[]>([]);
  categoriaActiva = signal<string>('Todas');
  comidas = signal<MealCard[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);
  agregado = signal<string | null>(null);

  ngOnInit(): void {
    this.mealService.obtenerCategorias().subscribe({
      next: (categorias) => this.categorias.set(categorias.slice(0, 8)),
      error: () => this.categorias.set([]),
    });
    this.cargarPorCategoria('Todas');
  }

  seleccionarCategoria(categoria: string) {
    this.categoriaActiva.set(categoria);
    this.busquedaNombre = '';
    this.busquedaIngrediente = '';
    this.cargarPorCategoria(categoria);
  }

  private cargarPorCategoria(categoria: string) {
    this.cargando.set(true);
    this.error.set(null);

    const categoriaConsulta = categoria === 'Todas' ? 'Chicken' : categoria;

    this.mealService.obtenerPorCategoria(categoriaConsulta).subscribe({
      next: (resumenes) => {
        const tarjetas = resumenes
          .slice(0, 12)
          .map((m) => this.mealService.aTarjetaResumen(m, categoria === 'Todas' ? undefined : categoria));
        this.comidas.set(tarjetas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar las comidas. Intenta de nuevo en unos segundos.');
        this.cargando.set(false);
      },
    });
  }

  buscar() {
    const nombre = this.busquedaNombre.trim();
    const ingrediente = this.busquedaIngrediente.trim();

    if (!nombre && !ingrediente) {
      this.cargarPorCategoria(this.categoriaActiva());
      return;
    }

    this.cargando.set(true);
    this.error.set(null);
    this.categoriaActiva.set('Todas');

    if (nombre) {
      this.mealService.buscarPorNombre(nombre).subscribe({
        next: (detalles) => {
          this.comidas.set(detalles.map((d) => this.mealService.aTarjetaDetalle(d)));
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No pudimos completar la búsqueda.');
          this.cargando.set(false);
        },
      });
      return;
    }

    this.mealService.buscarPorIngrediente(ingrediente).subscribe({
      next: (resumenes) => {
        this.comidas.set(resumenes.slice(0, 12).map((m) => this.mealService.aTarjetaResumen(m)));
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No pudimos completar la búsqueda.');
        this.cargando.set(false);
      },
    });
  }

  agregarAlCarrito(comida: MealCard) {
    this.carritoService.agregar({
      id: comida.id,
      tipo: 'comida',
      nombre: comida.nombre,
      imagen: comida.imagen,
      precioUnitario: comida.precio,
    });
    this.agregado.set(comida.id);
    setTimeout(() => this.agregado.set(null), 1200);
  }
}
