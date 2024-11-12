import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvideEnergyInputsComponent } from './provide-energy-inputs.component';

describe('ProvideEnergyInputsComponent', () => {
  let component: ProvideEnergyInputsComponent;
  let fixture: ComponentFixture<ProvideEnergyInputsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvideEnergyInputsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProvideEnergyInputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
