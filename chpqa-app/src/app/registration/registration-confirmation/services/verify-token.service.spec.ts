import { TestBed } from '@angular/core/testing';

import { VerifyTokenService } from './verify-token.service';

describe('VerifyTokenService', () => {
  let service: VerifyTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerifyTokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
