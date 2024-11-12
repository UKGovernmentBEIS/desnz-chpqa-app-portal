import { TestBed } from '@angular/core/testing';

import { QualityIndexThresholdService } from './quality-index-threshold.service';

describe('QualityIndexThresholdService', () => {
  let service: QualityIndexThresholdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QualityIndexThresholdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
