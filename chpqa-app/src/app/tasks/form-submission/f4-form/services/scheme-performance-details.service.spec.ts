import { TestBed } from '@angular/core/testing';

import { SchemePerformanceDetailsService } from './scheme-performance-details.service';

describe('SchemePerformanceDetailsService', () => {
  let service: SchemePerformanceDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SchemePerformanceDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
