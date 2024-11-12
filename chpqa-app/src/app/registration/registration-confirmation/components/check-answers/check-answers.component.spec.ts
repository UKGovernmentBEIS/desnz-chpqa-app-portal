import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckAnswersComponent } from './check-answers.component';

describe('CheckAnswersComponent', () => {
  let component: CheckAnswersComponent;
  let fixture: ComponentFixture<CheckAnswersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckAnswersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CheckAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
