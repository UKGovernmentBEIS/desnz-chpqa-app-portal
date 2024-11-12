import { TestBed } from '@angular/core/testing';

import { RpDashboardService } from './rp-dashboard.service';

describe('RpDashboardService', () => {
  let service: RpDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RpDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
