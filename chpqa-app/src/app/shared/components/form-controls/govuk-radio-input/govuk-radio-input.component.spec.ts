import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovukRadioInputComponent } from './govuk-radio-input.component';

describe('GovukRadioInputComponent', () => {
  let component: GovukRadioInputComponent;
  let fixture: ComponentFixture<GovukRadioInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovukRadioInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovukRadioInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
