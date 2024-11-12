import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewPerfomanceSummaryComponent } from './review-perfomance-summary.component';

describe('ReviewPerfomanceSummaryComponent', () => {
  let component: ReviewPerfomanceSummaryComponent;
  let fixture: ComponentFixture<ReviewPerfomanceSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewPerfomanceSummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReviewPerfomanceSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
