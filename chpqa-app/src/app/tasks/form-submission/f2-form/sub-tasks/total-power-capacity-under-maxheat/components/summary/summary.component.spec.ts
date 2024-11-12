import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalPowerCapacityUnderMaxHeatSummaryComponent } from './summary.component';

describe('TotalPowerCapacityUnderMaxHeatSummaryComponent', () => {
  let component: TotalPowerCapacityUnderMaxHeatSummaryComponent;
  let fixture: ComponentFixture<TotalPowerCapacityUnderMaxHeatSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalPowerCapacityUnderMaxHeatSummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TotalPowerCapacityUnderMaxHeatSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
