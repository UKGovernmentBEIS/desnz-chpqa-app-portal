import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovukCheckboxInputComponent } from './govuk-checkbox-input.component';

describe('GovukCheckboxInputComponent', () => {
  let component: GovukCheckboxInputComponent;
  let fixture: ComponentFixture<GovukCheckboxInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovukCheckboxInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovukCheckboxInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
