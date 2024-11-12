import { TestBed } from '@angular/core/testing';

import { FinancialBenefitsService } from './financial-benefits.service';

describe('FinancialBenefitsService', () => {
  let service: FinancialBenefitsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinancialBenefitsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
