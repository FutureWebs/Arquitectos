import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Planta3D } from './planta3-d';

describe('Planta3D', () => {
  let component: Planta3D;
  let fixture: ComponentFixture<Planta3D>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Planta3D]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Planta3D);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
