import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfomanceSummaryListComponent } from './perfomance-summary-list.component';

describe('PerfomanceSummaryListComponent', () => {
  let component: PerfomanceSummaryListComponent;
  let fixture: ComponentFixture<PerfomanceSummaryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfomanceSummaryListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PerfomanceSummaryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
