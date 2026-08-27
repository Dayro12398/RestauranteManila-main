import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { DrinkCard, DrinkDetail, DrinkSummary } from '../models/cocktail.model';
import { PrecioService } from './precio.service';

const BASE_URL = 'https://www.thecocktaildb.com/api/json/v1/1';

@Injectable({ providedIn: 'root' })
export class CocktailService {
  private http = inject(HttpClient);
  private precioService = inject(PrecioService);

  /** Lista de categorías de bebidas (ordinary_drink, cocktail, etc). */
  obtenerCategorias(): Observable<string[]> {
    return this.http
      .get<{ drinks: { strCategory: string }[] | null }>(`${BASE_URL}/list.php`, {
        params: { c: 'list' },
      })
      .pipe(map((res) => (res.drinks ?? []).map((d) => d.strCategory)));
  }

  /** Todas las bebidas de una categoría. */
  obtenerPorCategoria(categoria: string): Observable<DrinkSummary[]> {
    return this.http
      .get<{ drinks: DrinkSummary[] | null }>(`${BASE_URL}/filter.php`, {
        params: { c: categoria },
      })
      .pipe(map((res) => res.drinks ?? []));
  }

  /** Filtra bebidas por tipo: Alcoholic / Non_Alcoholic. */
  filtrarPorTipo(tipo: string): Observable<DrinkSummary[]> {
    return this.http
      .get<{ drinks: DrinkSummary[] | null }>(`${BASE_URL}/filter.php`, {
        params: { a: tipo },
      })
      .pipe(map((res) => res.drinks ?? []));
  }

  /** Búsqueda por nombre (trae detalle completo con ingredientes). */
  buscarPorNombre(nombre: string): Observable<DrinkDetail[]> {
    return this.http
      .get<{ drinks: DrinkDetail[] | null }>(`${BASE_URL}/search.php`, {
        params: { s: nombre },
      })
      .pipe(map((res) => res.drinks ?? []));
  }

  /** Busca bebidas que contienen un ingrediente. */
  buscarPorIngrediente(ingrediente: string): Observable<DrinkSummary[]> {
    return this.http
      .get<{ drinks: DrinkSummary[] | null }>(`${BASE_URL}/filter.php`, {
        params: { i: ingrediente },
      })
      .pipe(map((res) => res.drinks ?? []));
  }

  /** Detalle completo de una bebida por id. */
  obtenerDetalle(id: string): Observable<DrinkDetail | null> {
    return this.http
      .get<{ drinks: DrinkDetail[] | null }>(`${BASE_URL}/lookup.php`, {
        params: { i: id },
      })
      .pipe(map((res) => (res.drinks && res.drinks.length ? res.drinks[0] : null)));
  }

  /** Bebida aleatoria (para la bebida estrella de inicio). */
  obtenerAleatoria(): Observable<DrinkDetail | null> {
    return this.http
      .get<{ drinks: DrinkDetail[] | null }>(`${BASE_URL}/random.php`)
      .pipe(map((res) => (res.drinks && res.drinks.length ? res.drinks[0] : null)));
  }

  extraerIngredientes(detalle: DrinkDetail): string[] {
    const ingredientes: string[] = [];
    for (let i = 1; i <= 15; i++) {
      const ingrediente = detalle[`strIngredient${i}`];
      const medida = detalle[`strMeasure${i}`];
      if (ingrediente && ingrediente.trim()) {
        const medidaTexto = medida && medida.trim() ? `${medida.trim()} ` : '';
        ingredientes.push(`${medidaTexto}${ingrediente.trim()}`);
      }
    }
    return ingredientes;
  }

  aTarjetaResumen(drink: DrinkSummary, categoria?: string, alcoholica = true): DrinkCard {
    return {
      id: drink.idDrink,
      nombre: drink.strDrink,
      imagen: drink.strDrinkThumb,
      categoria,
      alcoholica,
      ingredientes: [],
      precio: this.precioService.precioParaId(drink.idDrink, 12000, 32000),
    };
  }

  aTarjetaDetalle(drink: DrinkDetail): DrinkCard {
    return {
      id: drink.idDrink,
      nombre: drink.strDrink,
      imagen: drink.strDrinkThumb,
      categoria: drink.strCategory,
      alcoholica: (drink.strAlcoholic ?? '').toLowerCase() === 'alcoholic',
      ingredientes: this.extraerIngredientes(drink),
      precio: this.precioService.precioParaId(drink.idDrink, 12000, 32000),
    };
  }
}
