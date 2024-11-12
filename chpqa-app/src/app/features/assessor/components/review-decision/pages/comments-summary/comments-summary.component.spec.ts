import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsSummaryComponent } from './comments-summary.component';

describe('CommentsSummaryComponent', () => {
  let component: CommentsSummaryComponent;
  let fixture: ComponentFixture<CommentsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentsSummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommentsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
