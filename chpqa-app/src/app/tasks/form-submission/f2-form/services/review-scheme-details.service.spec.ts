import { TestBed } from '@angular/core/testing';

import { ReviewSchemeDetailsService } from './review-scheme-details.service';

describe('ReviewSchemeDetailsService', () => {
  let service: ReviewSchemeDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReviewSchemeDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
