import { TestBed } from '@angular/core/testing';

import { PrimeMoverCrudService } from './prime-mover-crud.service';

describe('PrimeMoverCrudService', () => {
  let service: PrimeMoverCrudService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrimeMoverCrudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
