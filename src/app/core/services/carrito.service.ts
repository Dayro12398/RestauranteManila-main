import { Injectable, computed, signal } from '@angular/core';
import { CartItem, TipoItem } from '../models/cart-item.model';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();

  readonly totalItems = computed(() =>
    this._items().reduce((total, item) => total + item.cantidad, 0),
  );

  readonly totalPagar = computed(() =>
    this._items().reduce((total, item) => total + item.cantidad * item.precioUnitario, 0),
  );

  agregar(nuevo: Omit<CartItem, 'cantidad'>, cantidad = 1) {
    this._items.update((items) => {
      const existente = items.find((i) => i.id === nuevo.id && i.tipo === nuevo.tipo);
      if (existente) {
        return items.map((i) =>
          i.id === nuevo.id && i.tipo === nuevo.tipo
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i,
        );
      }
      return [...items, { ...nuevo, cantidad }];
    });
  }

  actualizarCantidad(id: string, tipo: TipoItem, cantidad: number) {
    if (cantidad <= 0) {
      this.quitar(id, tipo);
      return;
    }
    this._items.update((items) =>
      items.map((i) => (i.id === id && i.tipo === tipo ? { ...i, cantidad } : i)),
    );
  }

  quitar(id: string, tipo: TipoItem) {
    this._items.update((items) => items.filter((i) => !(i.id === id && i.tipo === tipo)));
  }

  vaciar() {
    this._items.set([]);
  }
}
