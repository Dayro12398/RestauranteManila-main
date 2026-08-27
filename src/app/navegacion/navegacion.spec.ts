import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Navegacion } from './navegacion';
import { provideRouter } from '@angular/router';

describe('Navegacion', () => {
  let component: Navegacion;
  let fixture: ComponentFixture<Navegacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navegacion],
      providers: [provideRouter([])]

    }).compileComponents();

    fixture = TestBed.createComponent(Navegacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
