import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovukTextareaInputComponent } from './govuk-textarea-input.component';

describe('GovukTextareaInputComponent', () => {
  let component: GovukTextareaInputComponent;
  let fixture: ComponentFixture<GovukTextareaInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovukTextareaInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovukTextareaInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
