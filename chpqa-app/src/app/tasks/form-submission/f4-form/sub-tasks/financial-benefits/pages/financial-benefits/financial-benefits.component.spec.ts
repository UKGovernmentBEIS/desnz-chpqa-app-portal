import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialBenefitsComponent } from './financial-benefits.component';

describe('FinancialBenefitsComponent', () => {
  let component: FinancialBenefitsComponent;
  let fixture: ComponentFixture<FinancialBenefitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialBenefitsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinancialBenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
