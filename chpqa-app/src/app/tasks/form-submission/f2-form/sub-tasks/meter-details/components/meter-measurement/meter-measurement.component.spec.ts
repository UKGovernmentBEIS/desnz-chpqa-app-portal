import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeterMeasurementComponent } from './meter-measurement.component';

describe('MeterMeasurementComponent', () => {
  let component: MeterMeasurementComponent;
  let fixture: ComponentFixture<MeterMeasurementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeterMeasurementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeterMeasurementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
