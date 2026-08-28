import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CocktailService } from '../core/services/cocktail.service';
import { CarritoService } from '../core/services/carrito.service';
import { DrinkCard } from '../core/models/cocktail.model';
import { ProductoModal } from '../shared/producto-modal/producto-modal';

@Component({
  selector: 'app-bebidas',
  imports: [FormsModule, DecimalPipe, ProductoModal],
  templateUrl: './bebidas.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './bebidas.css',
})
export class Bebidas implements OnInit {
  private cocktailService = inject(CocktailService);
  private carritoService = inject(CarritoService);

  busquedaNombre = '';
  busquedaIngrediente = '';
  tipoBebida = '';
  categoriaBebida = '';

  bebidas = signal<DrinkCard[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);
  agregado = signal<string | null>(null);
  quemando = signal<string | null>(null);

  productoModal = signal<DrinkCard | null>(null);
  descripcionModal = signal('');
  cargandoModal = signal(false);
  saliendoModal = signal(false);

  ngOnInit(): void {
    this.cargarPorCategoria('Cocktail');
  }

  private cargarPorCategoria(categoria: string) {
    this.cargando.set(true);
    this.error.set(null);

    this.cocktailService.obtenerPorCategoria(categoria).subscribe({
      next: (resumenes) => {
        this.bebidas.set(
          resumenes.slice(0, 12).map((b) => this.cocktailService.aTarjetaResumen(b, categoria)),
        );
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar las bebidas. Intenta de nuevo en unos segundos.');
        this.cargando.set(false);
      },
    });
  }

  buscar() {
    const nombre = this.busquedaNombre.trim();
    const ingrediente = this.busquedaIngrediente.trim();
    const tipo = this.tipoBebida;
    const categoria = this.categoriaBebida;

    this.cargando.set(true);
    this.error.set(null);

    if (nombre) {
      this.cocktailService.buscarPorNombre(nombre).subscribe({
        next: (detalles) => this.aplicarFiltrosLocales(detalles.map((d) => this.cocktailService.aTarjetaDetalle(d)), tipo, categoria),
        error: () => this.manejarError(),
      });
      return;
    }

    if (ingrediente) {
      this.cocktailService.buscarPorIngrediente(ingrediente).subscribe({
        next: (resumenes) =>
          this.aplicarFiltrosLocales(resumenes.map((b) => this.cocktailService.aTarjetaResumen(b)), tipo, categoria),
        error: () => this.manejarError(),
      });
      return;
    }

    if (categoria) {
      this.cocktailService.obtenerPorCategoria(categoria).subscribe({
        next: (resumenes) =>
          this.aplicarFiltrosLocales(
            resumenes.map((b) => this.cocktailService.aTarjetaResumen(b, categoria)),
            tipo,
            '',
          ),
        error: () => this.manejarError(),
      });
      return;
    }

    if (tipo) {
      this.cocktailService.filtrarPorTipo(tipo).subscribe({
        next: (resumenes) =>
          this.aplicarFiltrosLocales(
            resumenes.map((b) => this.cocktailService.aTarjetaResumen(b, undefined, tipo === 'Alcoholic')),
            '',
            '',
          ),
        error: () => this.manejarError(),
      });
      return;
    }

    this.cargarPorCategoria('Cocktail');
  }

  private aplicarFiltrosLocales(bebidas: DrinkCard[], tipo: string, categoria: string) {
    let resultado = bebidas;
    if (tipo) {
      const alcoholica = tipo === 'Alcoholic';
      resultado = resultado.filter((b) => b.alcoholica === alcoholica);
    }
    if (categoria) {
      resultado = resultado.filter((b) => (b.categoria ?? '').toLowerCase() === categoria.toLowerCase());
    }
    this.bebidas.set(resultado.slice(0, 12));
    this.cargando.set(false);
  }

  private manejarError() {
    this.error.set('No pudimos completar la búsqueda.');
    this.cargando.set(false);
  }

  /** Abre la ficha del producto. Si viene de un listado por categoría (sin
   * ingredientes cargados) trae el detalle completo antes de mostrarlo. */
  abrirModal(bebida: DrinkCard): void {
    this.productoModal.set(bebida);
    this.saliendoModal.set(false);
    this.descripcionModal.set('');

    if (bebida.ingredientes.length === 0) {
      this.cargandoModal.set(true);
      this.cocktailService.obtenerDetalle(bebida.id).subscribe({
        next: (detalle) => {
          this.cargandoModal.set(false);
          if (detalle) {
            const enriquecida = this.cocktailService.aTarjetaDetalle(detalle);
            this.productoModal.set({ ...enriquecida, precio: bebida.precio });
            const texto = (detalle.strInstructions ?? '').replace(/\r/g, ' ').trim();
            this.descripcionModal.set(texto.length > 220 ? `${texto.slice(0, 220).trim()}…` : texto);
          }
        },
        error: () => this.cargandoModal.set(false),
      });
    }
  }

  cerrarModal(): void {
    this.saliendoModal.set(true);
    setTimeout(() => {
      this.productoModal.set(null);
      this.saliendoModal.set(false);
    }, 200);
  }

  /** Confirma el agregado desde el modal (aquí sí impacta el carrito). */
  confirmarAgregarModal(): void {
    const bebida = this.productoModal();
    if (!bebida) return;
    this.agregarAlCarrito(bebida);
    setTimeout(() => this.cerrarModal(), 750);
  }

  agregarAlCarrito(bebida: DrinkCard) {
    this.carritoService.agregar({
      id: bebida.id,
      tipo: 'bebida',
      nombre: bebida.nombre,
      imagen: bebida.imagen,
      precioUnitario: bebida.precio,
    });
    this.agregado.set(bebida.id);
    this.quemando.set(bebida.id);
    setTimeout(() => this.agregado.set(null), 1200);
    setTimeout(() => {
      if (this.quemando() === bebida.id) {
        this.quemando.set(null);
      }
    }, 900);
  }

  /** La marca quemada en la tarjeta permanece mientras el producto siga en el pedido. */
  enCarrito(id: string): boolean {
    return this.carritoService.items().some((item) => item.id === id && item.tipo === 'bebida');
  }
}
