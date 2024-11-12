import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterEnergyInputComponent } from './enter-energy-input.component';

describe('EnterEnergyInputComponent', () => {
  let component: EnterEnergyInputComponent;
  let fixture: ComponentFixture<EnterEnergyInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnterEnergyInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EnterEnergyInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
