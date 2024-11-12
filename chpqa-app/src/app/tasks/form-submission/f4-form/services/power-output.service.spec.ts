/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PowerOutputService } from './power-output.service';

describe('Service: PowerOutput', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PowerOutputService]
    });
  });

  it('should ...', inject([PowerOutputService], (service: PowerOutputService) => {
    expect(service).toBeTruthy();
  }));
});
