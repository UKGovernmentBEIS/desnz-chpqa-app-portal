import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovukMonthlyInputComponent } from './govuk-monthly-input.component';

describe('GovukMonthlyInputComponent', () => {
  let component: GovukMonthlyInputComponent;
  let fixture: ComponentFixture<GovukMonthlyInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovukMonthlyInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovukMonthlyInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
