import { TestBed } from '@angular/core/testing';

import { MeterCrudService } from './meter-crud.service';

describe('MeterCrudService', () => {
  let service: MeterCrudService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeterCrudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
