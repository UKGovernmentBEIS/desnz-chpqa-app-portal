import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricsSummaryListComponent } from './metrics-summary-list.component';

describe('MetricsSummaryListComponent', () => {
  let component: MetricsSummaryListComponent;
  let fixture: ComponentFixture<MetricsSummaryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricsSummaryListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MetricsSummaryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
