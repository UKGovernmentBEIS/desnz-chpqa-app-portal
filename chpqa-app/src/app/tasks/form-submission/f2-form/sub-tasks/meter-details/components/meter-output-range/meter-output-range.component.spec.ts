import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeterOutputRangeComponent } from './meter-output-range.component';

describe('MeterOutputRangeComponent', () => {
  let component: MeterOutputRangeComponent;
  let fixture: ComponentFixture<MeterOutputRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeterOutputRangeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeterOutputRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
