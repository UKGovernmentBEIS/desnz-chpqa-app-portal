import { TestBed } from '@angular/core/testing';

import { DestroySubjectService } from './destroy-subject.service';

describe('DestroySubjectService', () => {
  let service: DestroySubjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DestroySubjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
