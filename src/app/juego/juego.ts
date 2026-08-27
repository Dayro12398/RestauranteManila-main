import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MealService } from '../core/services/meal.service';
import { CocktailService } from '../core/services/cocktail.service';

interface Carta {
  clave: string; // identifica el par (mismo valor en las dos cartas gemelas)
  imagen: string;
  volteada: boolean;
  encontrada: boolean;
}

@Component({
  selector: 'app-juego',
  imports: [],
  templateUrl: './juego.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './juego.css',
})
export class Juego implements OnInit {
  private mealService = inject(MealService);
  private cocktailService = inject(CocktailService);

  cartas = signal<Carta[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  intentos = signal(0);
  aciertos = signal(0);
  juegoGanado = signal(false);

  private indicesVolteados: number[] = [];
  private bloqueado = false;

  ngOnInit(): void {
    this.cargarImagenes();
  }

  private cargarImagenes() {
    this.cargando.set(true);
    this.error.set(null);
    this.juegoGanado.set(false);
    this.intentos.set(0);
    this.aciertos.set(0);

    // Pedimos 4 platos y 4 bebidas aleatorias en paralelo, para armar 8 parejas (16 cartas).
    forkJoin({
      platos: forkJoin([
        this.mealService.obtenerAleatoria(),
        this.mealService.obtenerAleatoria(),
        this.mealService.obtenerAleatoria(),
        this.mealService.obtenerAleatoria(),
      ]),
      bebidas: forkJoin([
        this.cocktailService.obtenerAleatoria(),
        this.cocktailService.obtenerAleatoria(),
        this.cocktailService.obtenerAleatoria(),
        this.cocktailService.obtenerAleatoria(),
      ]),
    }).subscribe({
      next: ({ platos, bebidas }) => {
        const imagenesPlatos = platos
          .filter((p): p is NonNullable<typeof p> => !!p)
          .map((p) => ({ clave: `plato-${p.idMeal}`, imagen: p.strMealThumb }));

        const imagenesBebidas = bebidas
          .filter((b): b is NonNullable<typeof b> => !!b)
          .map((b) => ({ clave: `bebida-${b.idDrink}`, imagen: b.strDrinkThumb }));

        const base = [...imagenesPlatos, ...imagenesBebidas].slice(0, 8);

        if (base.length < 8) {
          this.error.set('No pudimos cargar suficientes imágenes para el juego. Intenta reiniciar.');
          this.cargando.set(false);
          return;
        }

        const pares: Carta[] = [...base, ...base].map((item) => ({
          clave: item.clave,
          imagen: item.imagen,
          volteada: false,
          encontrada: false,
        }));

        this.cartas.set(this.mezclar(pares));
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar las imágenes del juego. Intenta reiniciar.');
        this.cargando.set(false);
      },
    });
  }

  private mezclar(cartas: Carta[]): Carta[] {
    const copia = [...cartas];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  voltear(index: number) {
    if (this.bloqueado) return;

    const cartas = this.cartas();
    const carta = cartas[index];
    if (!carta || carta.volteada || carta.encontrada) return;
    if (this.indicesVolteados.includes(index)) return;

    const nuevasCartas = cartas.map((c, i) => (i === index ? { ...c, volteada: true } : c));
    this.cartas.set(nuevasCartas);
    this.indicesVolteados.push(index);

    if (this.indicesVolteados.length === 2) {
      this.intentos.update((v) => v + 1);
      this.bloqueado = true;

      const [i1, i2] = this.indicesVolteados;
      const c1 = this.cartas()[i1];
      const c2 = this.cartas()[i2];

      if (c1.clave === c2.clave) {
        setTimeout(() => {
          this.cartas.update((cartas) =>
            cartas.map((c, i) => (i === i1 || i === i2 ? { ...c, encontrada: true } : c)),
          );
          this.aciertos.update((v) => v + 1);
          this.indicesVolteados = [];
          this.bloqueado = false;

          if (this.aciertos() === this.cartas().length / 2) {
            this.juegoGanado.set(true);
          }
        }, 500);
      } else {
        setTimeout(() => {
          this.cartas.update((cartas) =>
            cartas.map((c, i) => (i === i1 || i === i2 ? { ...c, volteada: false } : c)),
          );
          this.indicesVolteados = [];
          this.bloqueado = false;
        }, 800);
      }
    }
  }

  reiniciar() {
    this.cargarImagenes();
  }
}
