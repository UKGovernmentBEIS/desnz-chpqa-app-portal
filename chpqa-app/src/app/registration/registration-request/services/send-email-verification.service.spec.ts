import { TestBed } from '@angular/core/testing';

import { SendEmailVerificationService } from './send-email-verification.service';

describe('SendEmailVerificationService', () => {
  let service: SendEmailVerificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SendEmailVerificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
