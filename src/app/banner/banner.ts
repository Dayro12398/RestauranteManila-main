import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-banner',
  imports: [RouterLink],
  templateUrl: './banner.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './banner.css',
})
export class Banner {}
