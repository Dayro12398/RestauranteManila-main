import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MealService } from '../core/services/meal.service';
import { CocktailService } from '../core/services/cocktail.service';
import { MealCard } from '../core/models/meal.model';
import { DrinkCard } from '../core/models/cocktail.model';

@Component({
  selector: 'app-informacion',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './informacion.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './informacion.css',
})
export class Informacion implements OnInit {
  private mealService = inject(MealService);
  private cocktailService = inject(CocktailService);

  platoEstrella = signal<MealCard | null>(null);
  bebidaEstrella = signal<DrinkCard | null>(null);
  cargando = signal(true);

  ngOnInit(): void {
    this.mealService.obtenerAleatoria().subscribe({
      next: (detalle) => this.platoEstrella.set(detalle ? this.mealService.aTarjetaDetalle(detalle) : null),
      error: () => this.platoEstrella.set(null),
    });

    this.cocktailService.obtenerAleatoria().subscribe({
      next: (detalle) => {
        this.bebidaEstrella.set(detalle ? this.cocktailService.aTarjetaDetalle(detalle) : null);
        this.cargando.set(false);
      },
      error: () => {
        this.bebidaEstrella.set(null);
        this.cargando.set(false);
      },
    });
  }
}
