import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialBenefitsSummaryComponent } from './summary.component';

describe('SummaryComponent', () => {
  let component: FinancialBenefitsSummaryComponent;
  let fixture: ComponentFixture<FinancialBenefitsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialBenefitsSummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinancialBenefitsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
