import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewCommentsComponent } from './review-comments.component';

describe('ReviewCommentsComponent', () => {
  let component: ReviewCommentsComponent;
  let fixture: ComponentFixture<ReviewCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewCommentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReviewCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
