export type TipoItem = 'comida' | 'bebida';

export interface CartItem {
  id: string;
  tipo: TipoItem;
  nombre: string;
  imagen: string;
  precioUnitario: number;
  cantidad: number;
}
