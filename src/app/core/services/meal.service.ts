import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { MealCard, MealCategory, MealDetail, MealSummary } from '../models/meal.model';
import { PrecioService } from './precio.service';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

@Injectable({ providedIn: 'root' })
export class MealService {
  private http = inject(HttpClient);
  private precioService = inject(PrecioService);

  /** Todas las categorías de comida. */
  obtenerCategorias(): Observable<MealCategory[]> {
    return this.http
      .get<{ categories: MealCategory[] }>(`${BASE_URL}/categories.php`)
      .pipe(map((res) => res.categories ?? []));
  }

  /** Comidas resumidas (id, nombre, foto) filtradas por categoría. */
  obtenerPorCategoria(categoria: string): Observable<MealSummary[]> {
    return this.http
      .get<{ meals: MealSummary[] | null }>(`${BASE_URL}/filter.php`, {
        params: { c: categoria },
      })
      .pipe(map((res) => res.meals ?? []));
  }

  /** Búsqueda de comidas por nombre (trae el detalle completo, incluye ingredientes). */
  buscarPorNombre(nombre: string): Observable<MealDetail[]> {
    return this.http
      .get<{ meals: MealDetail[] | null }>(`${BASE_URL}/search.php`, {
        params: { s: nombre },
      })
      .pipe(map((res) => res.meals ?? []));
  }

  /** Búsqueda de comidas por ingrediente (solo trae resumen, sin ingredientes). */
  buscarPorIngrediente(ingrediente: string): Observable<MealSummary[]> {
    return this.http
      .get<{ meals: MealSummary[] | null }>(`${BASE_URL}/filter.php`, {
        params: { i: ingrediente },
      })
      .pipe(map((res) => res.meals ?? []));
  }

  /** Detalle completo de una comida por id (incluye ingredientes y medidas). */
  obtenerDetalle(id: string): Observable<MealDetail | null> {
    return this.http
      .get<{ meals: MealDetail[] | null }>(`${BASE_URL}/lookup.php`, {
        params: { i: id },
      })
      .pipe(map((res) => (res.meals && res.meals.length ? res.meals[0] : null)));
  }

  /** Una comida aleatoria (para el plato estrella de la página de inicio). */
  obtenerAleatoria(): Observable<MealDetail | null> {
    return this.http
      .get<{ meals: MealDetail[] | null }>(`${BASE_URL}/random.php`)
      .pipe(map((res) => (res.meals && res.meals.length ? res.meals[0] : null)));
  }

  /** Extrae la lista de ingredientes (no vacíos) de un detalle de comida. */
  extraerIngredientes(detalle: MealDetail): string[] {
    const ingredientes: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingrediente = detalle[`strIngredient${i}`];
      const medida = detalle[`strMeasure${i}`];
      if (ingrediente && ingrediente.trim()) {
        const medidaTexto = medida && medida.trim() ? `${medida.trim()} ` : '';
        ingredientes.push(`${medidaTexto}${ingrediente.trim()}`);
      }
    }
    return ingredientes;
  }

  /** Convierte un resumen (sin ingredientes) en una tarjeta lista para mostrar. */
  aTarjetaResumen(meal: MealSummary, categoria?: string): MealCard {
    return {
      id: meal.idMeal,
      nombre: meal.strMeal,
      imagen: meal.strMealThumb,
      categoria,
      ingredientes: [],
      precio: this.precioService.precioParaId(meal.idMeal, 18000, 42000),
    };
  }

  /** Convierte un detalle completo en una tarjeta con ingredientes. */
  aTarjetaDetalle(meal: MealDetail): MealCard {
    return {
      id: meal.idMeal,
      nombre: meal.strMeal,
      imagen: meal.strMealThumb,
      categoria: meal.strCategory,
      ingredientes: this.extraerIngredientes(meal),
      precio: this.precioService.precioParaId(meal.idMeal, 18000, 42000),
    };
  }

  vacio(): Observable<MealCard[]> {
    return of([]);
  }
}
