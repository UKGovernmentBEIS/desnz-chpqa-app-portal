import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeterTypeComponent } from './meter-type.component';

describe('meterTypeComponent', () => {
  let component: MeterTypeComponent;
  let fixture: ComponentFixture<MeterTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeterTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeterTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
