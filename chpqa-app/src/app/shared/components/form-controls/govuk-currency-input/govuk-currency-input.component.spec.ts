import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovukCurrencyInputComponent } from './govuk-currency-input.component';

describe('GovukCurrencyInputComponent', () => {
  let component: GovukCurrencyInputComponent;
  let fixture: ComponentFixture<GovukCurrencyInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovukCurrencyInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovukCurrencyInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
