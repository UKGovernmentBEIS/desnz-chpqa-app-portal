import { TestBed } from '@angular/core/testing';

import { OutputUnitService } from './output-unit.service';

describe('OutputUnitService', () => {
  let service: OutputUnitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OutputUnitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
