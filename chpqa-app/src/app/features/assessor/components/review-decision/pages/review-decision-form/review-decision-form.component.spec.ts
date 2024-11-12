import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewDecisionFormComponent } from './review-decision-form.component';

describe('ReviewDecisionFormComponent', () => {
  let component: ReviewDecisionFormComponent;
  let fixture: ComponentFixture<ReviewDecisionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewDecisionFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReviewDecisionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
