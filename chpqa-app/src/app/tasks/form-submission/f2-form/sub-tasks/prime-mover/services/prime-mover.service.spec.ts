/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PrimeMoverService } from './prime-mover.service';

describe('Service: PrimeMover', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PrimeMoverService]
    });
  });

  it('should ...', inject([PrimeMoverService], (service: PrimeMoverService) => {
    expect(service).toBeTruthy();
  }));
});
