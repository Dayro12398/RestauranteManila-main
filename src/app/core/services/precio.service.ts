import { Injectable } from '@angular/core';

/**
 * Genera precios "aleatorios" pero consistentes para ítems que vienen de
 * APIs externas que no incluyen precio (TheMealDB / TheCocktailDB).
 * Se usa un hash simple del id para que el mismo ítem siempre
 * tenga el mismo precio en cada render, sin necesidad de guardarlo.
 */
@Injectable({ providedIn: 'root' })
export class PrecioService {
  private hash(texto: string): number {
    let hash = 0;
    for (let i = 0; i < texto.length; i++) {
      hash = (hash << 5) - hash + texto.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  /** Precio aleatorio consistente entre min y max (por defecto rango de comida). */
  precioParaId(id: string, min = 18000, max = 42000): number {
    const rango = max - min;
    const valor = min + (this.hash(id) % rango);
    // redondear a múltiplos de 500 para que se vea como precio real
    return Math.round(valor / 500) * 500;
  }
}
