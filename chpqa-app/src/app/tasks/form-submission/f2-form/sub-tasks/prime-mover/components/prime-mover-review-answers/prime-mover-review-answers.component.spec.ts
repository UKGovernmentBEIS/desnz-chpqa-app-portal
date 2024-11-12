import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimeMoverReviewAnswersComponent } from './prime-mover-review-answers.component';

describe('PrimeMoverReviewAnswersComponent', () => {
  let component: PrimeMoverReviewAnswersComponent;
  let fixture: ComponentFixture<PrimeMoverReviewAnswersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimeMoverReviewAnswersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrimeMoverReviewAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
