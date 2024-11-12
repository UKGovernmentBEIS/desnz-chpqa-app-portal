import { TestBed } from '@angular/core/testing';

import { EnergyInputsService } from './energy-inputs.service';

describe('EnergyInputsService', () => {
  let service: EnergyInputsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnergyInputsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
