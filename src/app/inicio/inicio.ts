import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Banner } from '../banner/banner';
import { Informacion } from '../informacion/informacion';

@Component({
  selector: 'app-inicio',
  imports: [Banner, Informacion],
  templateUrl: './inicio.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './inicio.css',
})
export class Inicio {}
