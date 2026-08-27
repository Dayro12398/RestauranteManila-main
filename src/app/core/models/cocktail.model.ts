export interface DrinkSummary {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
}

export interface DrinkDetail extends DrinkSummary {
  strCategory?: string;
  strAlcoholic?: string;
  strGlass?: string;
  strInstructions?: string;
  [key: string]: string | undefined;
}

export interface DrinkCard {
  id: string;
  nombre: string;
  imagen: string;
  categoria?: string;
  alcoholica: boolean;
  ingredientes: string[];
  precio: number;
}
