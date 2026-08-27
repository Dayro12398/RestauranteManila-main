import { Routes } from '@angular/router';
import { Comidas } from './comidas/comidas';
import { Bebidas } from './bebidas/bebidas';
import { Juego } from './juego/juego';
import { Inicio } from './inicio/inicio';
import { Pedido } from './pedido/pedido';

export const routes: Routes = [

    {path: '', component: Inicio},
    {path: 'comidas', component: Comidas},
    {path: 'bebidas', component: Bebidas},
    {path: 'pedido', component: Pedido},
    {path: 'juego', component: Juego},
    {path: '**', redirectTo: ''}
];
