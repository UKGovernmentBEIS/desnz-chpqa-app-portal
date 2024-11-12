import { TestBed } from '@angular/core/testing';

import { CondensingSteamTurbineService } from './condensing-steam-turbine.service';

describe('CondensingSteamTurbineService', () => {
  let service: CondensingSteamTurbineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CondensingSteamTurbineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
