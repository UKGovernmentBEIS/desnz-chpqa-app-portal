import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedActionsComponent } from './related-actions.component';

describe('RelatedActionsComponent', () => {
  let component: RelatedActionsComponent;
  let fixture: ComponentFixture<RelatedActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatedActionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RelatedActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
