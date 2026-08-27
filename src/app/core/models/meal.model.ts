export interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

export interface MealCategory {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface MealDetail extends MealSummary {
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  [key: string]: string | undefined;
}

export interface MealCard {
  id: string;
  nombre: string;
  imagen: string;
  categoria?: string;
  ingredientes: string[];
  precio: number;
}
